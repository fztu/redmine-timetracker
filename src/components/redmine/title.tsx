import React from "react";
import { useRouterContext, TitleProps } from "@pankod/refine-core";
import "./styles.css";

export const RedmineTitle: React.FC<TitleProps> = ({ collapsed }) => {
    const { Link } = useRouterContext();

    return (
        <Link to="/">
            {collapsed ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <img
                        src="https://www.silksoftware.com/wp-content/uploads/2019/05/cropped-SilkFavicon-32x32.png"
                        alt="Redmine"
                        style={{
                            margin: "0 auto",
                            padding: "12px 0",
                            maxHeight: "65.5px",
                        }}
                    />
                </div>
            ) : (
                <img
                    src="https://www.silksoftware.com/wp-content/uploads/2021/06/Silk-Logo-2021-white-wordmark.svg"
                    alt="Redmine"
                    style={{
                        width: "200px",
                        padding: "12px 24px",
                    }}
                />
            )}
        </Link>
    );
};