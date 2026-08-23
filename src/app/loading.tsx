function Bar({width, height}: {width: number | string; height: number}) {
    return <div className="skeleton" style={{width, height}} />
}

export default function Loading() {
    return (
        <div style={{
            display: "flex",
            height: "100vh",
        }}>
            <div style={{
                width: 240,
                flex: "none",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FAFAFA",
            }}>
                <div style={{
                    padding: "20px 20px 18px",
                    borderBottom: "1px solid #EAEAEA",
                }}>
                    <Bar width={110} height={18} />
                </div>

                <div style={{
                    padding: "14px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}>
                    <Bar width="100%" height={36} />
                    <Bar width="100%" height={36} />
                </div>

                <div style={{
                    marginTop: 6,
                    padding: "14px 24px 8px",
                    borderTop: "1px solid #EAEAEA",
                }}>
                    <Bar width={40} height={12} />
                </div>

                <div style={{
                    padding: "4px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                }}>
                    {Array.from({length: 6}).map((_, i) => (
                        <div key={i} style={{
                            height: 30,
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <Bar width="70%" height={14} />
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: "auto",
                    borderTop: "1px solid #EAEAEA",
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <div
                        className="skeleton"
                        style={{width: 28, height: 28, borderRadius: "50%", flex: "none"}}
                    />
                    <Bar width={130} height={14} />
                </div>
            </div>

            <div style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FFFFFF",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "0 28px",
                    flex: "none",
                    height: 60,
                    borderBottom: "1px solid #EAEAEA",
                }}>
                    <Bar width={80} height={18} />
                    <Bar width={380} height={38} />
                    <div style={{marginLeft: "auto", display: "flex", gap: 10}}>
                        <Bar width={110} height={38} />
                        <Bar width={120} height={38} />
                    </div>
                </div>

                <div style={{
                    flex: "none",
                    borderBottom: "1px solid #F0F0F0",
                    padding: "16px 28px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <div style={{display: "flex", gap: 6}}>
                        {[70, 60, 90, 62, 76, 66].map((width, i) => (
                            <Bar key={i} width={width} height={30} />
                        ))}
                    </div>
                    <div style={{marginLeft: "auto"}}>
                        <Bar width={150} height={30} />
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflow: "hidden",
                    padding: "0 28px",
                }}>
                    {Array.from({length: 8}).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "64px 1fr 260px 96px",
                                alignItems: "center",
                                gap: 18,
                                height: 64,
                                borderBottom: "1px solid #F0F0F0",
                            }}
                        >
                            <Bar width={40} height={18} />

                            <div style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 7,
                            }}>
                                <Bar width="55%" height={14} />
                                <Bar width="80%" height={12} />
                            </div>

                            <div style={{display: "flex", gap: 5}}>
                                <Bar width={78} height={18} />
                                <Bar width={54} height={18} />
                            </div>

                            <div style={{display: "flex", justifyContent: "flex-end"}}>
                                <Bar width={38} height={12} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
