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
                        <Bar width={92} height={38} />
                        <Bar width={126} height={38} />
                    </div>
                </div>

                <div style={{
                    flex: "none",
                    padding: "14px 28px",
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #F0F0F0",
                }}>
                    <Bar width={40} height={12} />
                    <div style={{marginLeft: "auto"}}>
                        <Bar width={150} height={30} />
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflow: "hidden",
                    padding: "24px 28px",
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "188px",
                    gap: 20,
                    alignContent: "start",
                }}>
                    {Array.from({length: 6}).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                border: "1px solid #E5E5E5",
                                borderRadius: 6,
                                padding: 20,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            <Bar width="65%" height={15} />

                            <div style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}>
                                <Bar width="100%" height={12} />
                                <Bar width="96%" height={12} />
                                <Bar width="88%" height={12} />
                                <Bar width="60%" height={12} />
                            </div>

                            <Bar width={72} height={12} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
