"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link"

export default function Page() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [completeMessage, setCompleteMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDisplayPassword, setIsDisplayPassword] = useState(false)

    const isPasswordMismatch =
        passwordConfirm !== "" && password !== passwordConfirm;

        async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>){
            e.preventDefault()

            if(isSubmitting) return;

            setErrorMessage("");
            setCompleteMessage("");

            if(email === "" || password === "" || passwordConfirm === ""){
                setErrorMessage("すべての項目を入力してください。");
                return;
            }
            if(password !== passwordConfirm){
                setErrorMessage("パスワードが一致しません。");
                return;
            }

            setIsSubmitting(true);
            try {
                const supabase = createClient();
                const {error} = await supabase.auth.signUp({email, password});

                if(error){
                    setErrorMessage(error.message);
                    return;
                }

                setCompleteMessage("確認メールを送りました。メール内のリンクから登録を完了してください。");
            } finally {
                setIsSubmitting(false);
            }
        }

        function displayPassword(){
            setIsDisplayPassword((prev) => !prev);
        }



    return (
        <div
        style={{
            minHeight: "100vh",
            backgroundColor: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 12,
            color: "#111111",
        }}
        >
        <div
            style={{
            width: 400,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            }}
        >
            <div style={{
                textAlign: "center"
            }}
            >
                <h1 style={{
                    fontSize: 24,
                    fontWeight: 600,
                }}
                >
                    LabMemo
                </h1>
                <p style={{
                    fontSize: 12.5,
                    color: "#6E6E6E",
                    marginTop: 6,
                }}
                >
                    アカウントを作成する
                </p>
            </div>
            <form
                onSubmit={handleSubmit}
                style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: 6,
                padding: "30px 30px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
            }}
            >
                {errorMessage !== "" && (
                    <p style={{
                        fontSize: 12.5,
                        color: "#B14B2C",
                        border: "1px solid #B14B2C",
                        borderRadius: 6,
                        padding: "10px 12px",
                        margin: 0,
                    }}
                    >
                        {errorMessage}
                    </p>
                )}
                {completeMessage !== "" && (
                    <p style={{
                        fontSize: 12.5,
                        color: "#1A66C4",
                        border: "1px solid #1A66C4",
                        borderRadius: 6,
                        padding: "10px 12px",
                        margin: 0,
                        lineHeight: 1.7,
                    }}
                    >
                        {completeMessage}
                    </p>
                )}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
                >
                    <label
                        htmlFor="email"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 500,
                        }}
                    >
                        メールアドレス
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            height: 38,
                            border: "1px solid #DDDDDD",
                            borderRadius: 6,
                            padding: "0 12px",
                            fontSize: 13.5,
                        }}
                    />
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
                >
                    <label
                        htmlFor="password"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 500,
                        }}
                    >
                        パスワード
                    </label>
                    <div style={{
                        position: "relative",
                        display: "flex",
                    }}
                    >
                        <input
                            id="password"
                            type={isDisplayPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            style = {{
                                flex: 1,
                                height: 38,
                                border: "1px solid #DDDDDD",
                                borderRadius: 6,
                                padding: "0 52px 0 12px",
                                fontSize: 13.5,
                            }}
                        />
                        <button
                            type="button"
                            onClick={displayPassword}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: 0,
                                height: 38,
                                border: "none",
                                background: "none",
                                padding: 0,
                                fontSize: 12,
                                color: "#1A66C4",
                                cursor: "pointer",
                            }}
                        >
                            {isDisplayPassword ? "隠す" : "表示"}
                        </button>
                    </div>
                </div>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
                >
                    <label
                        htmlFor="passwordConfirm"
                        style={{
                            fontSize: 12.5,
                            fontWeight: 500,
                        }}
                    >
                        パスワード（確認）
                    </label>
                    <input
                        id="passwordConfirm"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        style={{
                            height: 38,
                            border: isPasswordMismatch
                                ? "1.5px solid #B14B2C"
                                : "1px solid #DDDDDD",
                            borderRadius: 6,
                            padding: "0 12px",
                            fontSize: 13.5,
                        }}
                    />
                    {isPasswordMismatch && (
                        <p style={{
                            fontSize: 12,
                            color: "#B14B2C",
                            marginTop: 2,
                        }}
                        >
                            パスワードが一致しません。
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        height: 42,
                        border: "none",
                        borderRadius: 6,
                        backgroundColor: "#1A66C4",
                        color: "#FFFFFF",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1,
                        marginTop: 2,
                    }}>
                        {isSubmitting ? "登録中..." : "登録する"}
                </button>
            </form>
            <div 
                style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#444444",
                    }}
            >
                すでにアカウントをお持ちの方は{" "}
                <Link href="/login" style={{ color: "#1A66C4" }}>
                    ログイン
                </Link>
            </div>
        </div>
        </div>
    );
}
