import { useState } from "react";
import CodeEditor from '@uiw/react-textarea-code-editor';


const Code = () => {
    const [code, setCode] = useState(
        `CREATE POLICY 
        "Authenticated users can delete their own records" 
        ON public.user_details 
        AS PERMISSIVE 
        FOR DELETE 
        TO authenticated 
        USING ((( SELECT auth.uid() AS uid) = user_id))`
    );
    return (
        <div className="mockup-code w-full bg-base-200">
            <CodeEditor
                value={code}
                language="plsql"
                placeholder="Please enter SQL code."
                onChange={(evn) => setCode(evn.target.value)}
                padding={15}
                style={{
                    backgroundColor: "var(--color-base-200)",
                }}
            />
        </div>

    );
};

export default Code 