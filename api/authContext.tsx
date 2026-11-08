import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import type { Professor } from "../data/entities/professor";
import { supabase } from "../src/app/supabase";

/**
 * Dados guardados enquanto o usuário está logado.
 * - userId: uuid do usuário na tabela auth.users do Supabase
 * - professor: registro do professor associado a esse usuário (id e nome)
 */
export type SessaoUsuario = {
    userId: string;
    professor: Professor;
};

type SessaoContextValue = {
    userId: string | null;
    professor: Professor | null;

    iniciarSessao: (sessao: SessaoUsuario) => void;

    encerrarSessao: () => void;
};


const SessaoContext = createContext<SessaoContextValue | undefined>(undefined);

export function SessaoProvider({ children }: { children: ReactNode }) {
    const [sessao, setSessao] = useState<SessaoUsuario | null>(null);

    
    const iniciarSessao = useCallback((nova: SessaoUsuario) => setSessao(nova), []);
    const encerrarSessao = useCallback(async () => {
        setSessao(null);
        await supabase.auth.signOut();
    }, []);

    
    const value = useMemo<SessaoContextValue>(
        () => ({
            userId: sessao?.userId ?? null,
            professor: sessao?.professor ?? null,
            iniciarSessao,
            encerrarSessao,
        }),
        [sessao, iniciarSessao, encerrarSessao],
    );

    return <SessaoContext.Provider value={value}>{children}</SessaoContext.Provider>;
}


export function useAuth(): SessaoContextValue {
    const contexto = useContext(SessaoContext);
    if (!contexto) {
        throw new Error("useSessao deve ser usado dentro de <SessaoProvider>");
    }
    return contexto;
}