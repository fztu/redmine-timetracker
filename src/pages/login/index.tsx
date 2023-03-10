import React from "react";
import { useLogin } from "@pankod/refine-core";
import {
    Row,
    Col,
    AntdLayout,
    Card,
    Typography,
    Form,
    Input,
    Button,
    Checkbox,
} from "@pankod/refine-antd";
import "./styles.css";

const { Text, Title } = Typography;

export interface ILoginForm {
    username: string;
    password: string;
    remember: boolean;
}
const REDMINE_URL = process.env.REDMINE_URL ? "" : "https://redmineb2b.silksoftware.com";

export const Login: React.FC = () => {
    const [form] = Form.useForm<ILoginForm>();

    const { mutate: login } = useLogin<ILoginForm>();

    const CardTitle = (
        <Title level={3} className="title">
            Sign in with your RedmineB2B account
        </Title>
    );

    return (
        <AntdLayout className="layout">
            <Row
                justify="center"
                align="middle"
                style={{
                    height: "100vh",
                }}
            >
                <Col xs={22}>
                    <div className="container">
                        <Card title={CardTitle} headStyle={{ borderBottom: 0 }}>
                            <Form<ILoginForm>
                                layout="vertical"
                                form={form}
                                onFinish={(values) => {
                                    login(values);
                                }}
                                requiredMark={false}
                                initialValues={{
                                    remember: false,
                                }}
                            >
                                <Form.Item
                                    name="username"
                                    label="Username"
                                    rules={[{ required: true }]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Username"
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Password"
                                    rules={[{ required: true }]}
                                    style={{ marginBottom: "12px" }}
                                >
                                    <Input
                                        type="password"
                                        placeholder="????????????????????????"
                                        size="large"
                                    />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    block
                                >
                                    Sign in
                                </Button>
                            </Form>
                            <ul style={{color:'red', fontWeight: 'bold'}}>
                                <li>Please use your https://redmineb2b.silksoftware.com account to login.</li>
                                <li>This web application is for Silk Software internal employee only.</li>
                                <li>This web application does not save your Redmine account.</li>
                                <li>This web application will store certain data in your local browser.</li>
                            </ul>
                        </Card>
                    </div>
                </Col>
            </Row>
        </AntdLayout>
    );
};