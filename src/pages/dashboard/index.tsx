import {
    Row,
    Col,
    Card,
    Typography,
    Space,
    Avatar,
    Grid,
    CreateButton,
    Descriptions
} from "@pankod/refine-antd";
import { useTranslation } from "react-i18next";



const { Text } = Typography;
const { useBreakpoint } = Grid;

export const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { xl } = useBreakpoint();

    const REDMINE_USER = "redmine_user";
    const redmine_user = localStorage.getItem(REDMINE_USER) ?? "{}";
    const user = JSON.parse(redmine_user);

    return (
        <Row gutter={[16, 16]}>
            <Col xl={16} lg={12} md={24} sm={24} xs={24}>
                <Card
                    bodyStyle={{
                        padding: 10,
                        paddingBottom: 0,
                    }}
                >
                    <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginBottom: "16px",
                            }}
                        >
                            <Text style={{ fontSize: "24px" }} strong>
                                Time Tracker
                            </Text>
                            <CreateButton onClick={() => alert("Clicked Me")}>
                                Add Time Entry
                            </CreateButton>
                        </div>
                </Card>
            </Col>
            <Col xl={8} lg={24} md={24} sm={24} xs={24}>
                <Card
                    bordered={false}
                    style={{
                        height: "100%",
                    }}
                >
                    <Space
                        direction="vertical"
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Space
                            direction="vertical"
                            style={{
                                textAlign: "center",
                                width: "100%",
                            }}
                        >
                            <Avatar
                                size={120}
                                src='https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Kurt&facialHairType=BeardMedium&facialHairColor=Black&clotheType=BlazerShirt&eyeType=Close&eyebrowType=UpDown&mouthType=Default&skinColor=Light'
                            ></Avatar>
                            <Typography.Title level={3}>
                                {user?.firstname} {user?.lastname}
                            </Typography.Title>
                        </Space>
                        <Descriptions title=""
                            bordered
                            // layout="vertical"
                            column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                        >
                            <Descriptions.Item label="ID">{user?.id}</Descriptions.Item>
                            <Descriptions.Item label="Login">{user?.login}</Descriptions.Item>
                            <Descriptions.Item label="Email">{user?.mail}</Descriptions.Item>
                            {/* <Descriptions.Item label="API Key">{user?.api_key}</Descriptions.Item> */}
                            <Descriptions.Item label="Status">{user?.status == 1 ? 'Active' : 'Locked'}</Descriptions.Item>
                            <Descriptions.Item label="Created On">{user?.created_on}</Descriptions.Item>
                            <Descriptions.Item label="Last Login On" span={2}>{user?.last_login_on}</Descriptions.Item>
                        </Descriptions>
                    </Space>
                </Card>
            </Col>
        </Row>
    );
};