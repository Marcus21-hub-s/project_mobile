import type { Professor } from "../data/entities/professor";
import { supabase } from "../src/app/supabase";
import type { SessaoUsuario } from "./authContext";

/**
 * Motivos de falha do login, para a tela poder mostrar a mensagem certa:
 * - credenciais: e-mail/matrícula ou senha incorretos
 * - sem_professor: o login funcionou, mas o usuário não tem professor associado
 * - falha: erro ao consultar o professor (rede, permissão, dados duplicados...)
 */
export type MotivoErro = "credenciais" | "sem_professor" | "falha";

type LoginProps = {
    email: string;
    password: string;
    onError: (motivo: MotivoErro) => void;
    onSuccess: (sessao: SessaoUsuario) => void;
}

/**
 * >>> CONSULTA PROVISÓRIA NO SUPABASE <<<
 * Busca o professor ligado a um usuário (coluna `user_id` da tabela `professor`,
 * que guarda o uuid de auth.users). Devolve null se o usuário não tiver professor.
 * Troque o corpo desta função quando existir a API oficial.
 */
export const getProfessorByUserId = async (userId: string): Promise<Professor | null> => {
    const { data, error } = await supabase
        .from("professor")
        .select("id, nome")
        .eq("user_id", userId)
        .maybeSingle(); // 0 linhas -> data = null; 2 ou mais linhas -> error

    if (error) {
        console.log("Erro puxando dados do professor", error);
        throw new Error("Falha ao buscar o professor");
    }

    return data;
}

/**
 * Faz o login no Supabase Auth e, se der certo, busca o professor do usuário.
 * Entrega ao onSuccess os dados que a tela deve guardar no contexto (uuid + professor).
 */
export async function handleLogin({ email, password, onError, onSuccess }: LoginProps) {
    // Autentica na tabela auth.users do Supabase; `data.user.id` é o uuid do usuário
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error || !data.user) {
        onError("credenciais");
        return;
    }

    let professor: Professor | null;
    try {
        professor = await getProfessorByUserId(data.user.id);
    } catch (e) {
        // O login passou, mas não deu para carregar o professor: desfaz a sessão para não ficar meio logado
        await supabase.auth.signOut();
        onError("falha");
        return;
    }

    if (!professor) {
        await supabase.auth.signOut();
        onError("sem_professor");
        return;
    }

    onSuccess({ userId: data.user.id, professor });
}