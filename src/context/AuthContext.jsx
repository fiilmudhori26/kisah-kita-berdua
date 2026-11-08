import {createContext,useContext,useEffect,useState} from 'react'; import {supabase} from '../lib/supabase';
const AuthContext=createContext(null);
export function AuthProvider({children}){const [session,setSession]=useState(null);const [loading,setLoading]=useState(true);
useEffect(()=>{if(!supabase){setLoading(false);return;}supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);setLoading(false)});return()=>subscription.unsubscribe()},[]);
return <AuthContext.Provider value={{session,user:session?.user??null,loading}}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext);
