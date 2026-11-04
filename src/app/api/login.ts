import { supabase } from "../supabase";

type LoginProps = {
    email: string;
    password: string;
    onError: ()=> void;
    onSuccess: ()=>void;
}

export async function handleLogin({email, password, onError, onSuccess}: LoginProps){
    const {error} = await supabase.auth.signInWithPassword({
        email, 
        password
    });

    if(error){
        onError();
    }
    else{
        onSuccess();
    }
}