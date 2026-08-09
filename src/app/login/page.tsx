"use client"
import {useState} from "react"
import {useRouter} from "next/navigation"
import Link from "next/link"
import {createClient} from "@/lib/supabase/client"
export default function Page(){
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isDisplayPassword, setIsDisplayPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()

        if(isSubmitting) return;

        setErrorMessage("");

        if(email === "" || password === ""){
            setErrorMessage("メールアドレスとパスワードを入力してください。");
            return;
        }

        setIsSubmitting(true);
        try {
            const supabase = createClient();
            const {error} = await supabase.auth.signInWithPassword({email, password});

            if(error){
                setErrorMessage("メールアドレスまたはパスワードが正しくありません。");
                return;
            }

            router.push("/");
            router.refresh();
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
                    }}>
                        <h1 style={{
                            fontSize: 24,
                            fontWeight: 600,
                        }}>
                            LabMemo
                        </h1>

                        <p style={{
                            fontSize: 12.5,
                            color: "#6E6E6E",
                            marginTop: 6,
                        }}
                        >
                            アカウントにログインする
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
                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 9,
                                backgroundColor: "#FDF3EF",
                                border: "1px solid #F0D9D0",
                                borderRadius: 6,
                                padding: "10px 12px",
                            }}
                            >
                                <span style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    backgroundColor: "#B14B2C",
                                    color: "#FFFFFF",
                                    fontSize: 11,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flex: "none",
                                    marginTop: 1,
                                }}
                                >
                                    !
                                </span>
                                <span style={{
                                    fontSize: 12.5,
                                    lineHeight: 1.7,
                                    color: "#8F3D24",
                                }}
                                >
                                    {errorMessage}
                                </span>
                            </div>
                        )}
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                        }}>
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
                        }}>
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
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
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
                        }}
                        >
                            {isSubmitting ? "ログイン中..." : "ログイン"}
                        </button>
                    </form>

                    <div style={{
                        textAlign: "center",
                        fontSize: 13,
                        color: "#444444",
                    }}
                    >
                        アカウントをお持ちでない方は{" "}
                        <Link href="/register" style={{ color: "#1A66C4" }}>
                            会員登録
                        </Link>
                    </div>
            </div>
        </div>
    )
}