import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Space,
    Avatar,
    Grid,
    CreateButton,
    Descriptions,
    List,
    Table,
    Form,
    Select,
    Input,
    Modal,
    EditButton,
    ShowButton,
    useTable,
    useModalForm,
    DatePicker,
    Cascader,
    Button,
    Radio,
    DeleteButton,
    TextField,
    Tooltip
} from "@pankod/refine-antd";
import { useList, useCreate } from "@pankod/refine-core";
import { PlayCircleOutlined, PauseCircleOutlined, UserOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";
import { ITimeEntry, IProject, Option } from "../../interfaces";
import type { DefaultOptionType } from 'antd/es/cascader';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useStopwatch } from 'react-timer-hook';
import { tab } from '@testing-library/user-event/dist/tab';

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

const activities = [
    {
        "value": 8,
        "label": "Design"
    },
    {
        "value": 9,
        "label": "Development"
    },
    {
        "value": 19,
        "label": "Development (O)"
    },
    {
        "value": 10,
        "label": "Requirement"
    },
    {
        "value": 11,
        "label": "Testing"
    },
    {
        "value": 12,
        "label": "Deployment"
    },
    {
        "value": 13,
        "label": "Management"
    },
    {
        "value": 14,
        "label": "Documentation"
    },
    {
        "value": 15,
        "label": "Meeting"
    },
    {
        "value": 16,
        "label": "R&D"
    },
    {
        "value": 17,
        "label": "Marketing"
    },
    {
        "value": 18,
        "label": "Standby"
    }
];

const API_URL = process.env.REACT_APP_REDMINE_API_URL ?? "";
const TOKEN_KEY = process.env.REACT_APP_REDMINE_TOKEN_KEY ?? "redmine_api_key";
const REDMINE_USER = process.env.REACT_APP_REDMINE_USER_KEY ?? "redmine_user";
const ALL_PROJECTS_KEY = process.env.REACT_APP_REDMINE_ALL_PROJECTS_KEY ?? "redmine_projects";
const LEVEL1_PROJECTS_KEY = process.env.REACT_APP_REDMINE_LEVEL1_PROJECTS_KEY ?? "redmine_projects_level1";
const LEVEL2_PROJECTS_KEY = process.env.REACT_APP_REDMINE_LEVEL2_PROJECTS_KEY ?? "redmine_projects_level2";
const LOCAL_TIME_ENTRIES_KEY = process.env.REACT_APP_LOCAL_TIME_ENTRIES_KEY ?? "timeentries";

export const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { xl } = useBreakpoint();
    const [form] = Form.useForm();
    const {
        seconds: timerSeconds,
        minutes: timerMinutes,
        hours: timerHours,
        days: timerDays,
        isRunning: timerIsRunning,
        start: timerStart,
        pause: timerPause,
        reset: timerReset,
    } = useStopwatch({ autoStart: false });

    const onTimerStart = () => {
        let seconds = form.getFieldValue("hours") * 60 * 60;
        const stopwatchOffset = new Date();
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + seconds);
        timerReset(stopwatchOffset);
        timerStart();
    }

    const onTimerPause = () => {
        let h = timerDays * 24 + timerHours + timerMinutes / 60 + timerSeconds / 60 / 60;
        h = Math.round(h * 10000) / 10000;
        form.setFieldsValue({
            hours: h
        });
        timerReset();
        timerPause();
    }

    const onHoursBlur = (e: any) => {
        let seconds = form.getFieldValue("hours") * 60 * 60;
        const stopwatchOffset = new Date();
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + seconds);
        timerReset(stopwatchOffset);
        timerPause();
    }

    const redmine_user = localStorage.getItem(REDMINE_USER) ?? "{}";
    const user = JSON.parse(redmine_user);

    const level1ProjectsKey = "redmine_projects_level1";
    let level1Projects = new Array<IProject>();
    let savedLevel1Projects = localStorage.getItem(level1ProjectsKey) ?? "[]";
    level1Projects = JSON.parse(savedLevel1Projects);
    let level1ProjectOptions = new Array();
    level1Projects.forEach((value, index) => {
        let o = {
            "label": value.name,
            "value": value.id,
            "children": new Array()
        };
        if (value.children) {
            value.children.forEach((c, i) => {
                o.children.push({
                    "label": c.name,
                    "value": c.id,
                });
            })
        }
        level1ProjectOptions.push(o);
    });

    const filterOptions = (inputValue: string, path: DefaultOptionType[]) =>
        path.some(
            (option) => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
        );

    const [loadings, setLoadings] = useState<boolean[]>([]);

    const enterLoading = (index: number) => {
        setLoadings((prevLoadings) => {
            const newLoadings = [...prevLoadings];
            newLoadings[index] = true;
            return newLoadings;
        });

        setTimeout(() => {
            setLoadings((prevLoadings) => {
                const newLoadings = [...prevLoadings];
                newLoadings[index] = false;
                return newLoadings;
            });
        }, 6000);
    };

    const onReset = () => {
        form.resetFields();
    };

    let savedLocalTimeEntries = localStorage.getItem(LOCAL_TIME_ENTRIES_KEY) ?? "{}";
    let localTimeEntries = JSON.parse(savedLocalTimeEntries);
    // console.log(localTimeEntries);
    let localTimeEntriesTableData = Object.keys(localTimeEntries).map(function (key) { return localTimeEntries[key]; });

    const onSaveDraft = () => {
        console.log("Save Draft");
        if (timerIsRunning) {
            onTimerPause();
        }
        form.validateFields(["hours", "comments"])
            .then((values) => {
                console.log(values);
                const formValues = form.getFieldsValue();
                localTimeEntries[formValues["id"]] = formValues;
                localStorage.setItem(LOCAL_TIME_ENTRIES_KEY, JSON.stringify(localTimeEntries));
                form.resetFields();
                timerReset();
                timerPause();
            })
            .catch((errorInfo) => {
                console.log(errorInfo);
            });
    };

    const { mutate: createTimeEntry } = useCreate<ITimeEntry>();
    
    const onSaveToRedmine = () => {
        console.log("Save to Redmine");
        if (timerIsRunning) {
            onTimerPause();
        }
        form.validateFields()
            .then((values) => {
                const formValues = form.getFieldsValue();
                const timeEntry = {
                    "project_id": formValues["project"][formValues["project"].length - 1],
                    "spent_on": dayjs(formValues["spent_on"]).format('YYYY-MM-DD'),
                    "hours": formValues["hours"],
                    "activity_id": formValues["activity_id"],
                    "comments": formValues["comments"],
                    "user_id": user?.id
                };
                console.log(timeEntry);
                // createTimeEntry({
                //     resource: "time_entries",
                //     values: {
                //         time_entry: timeEntry
                //     },
                // });
            })
            .catch((errorInfo) => {
                console.log(errorInfo);
            });
    }

    const { tableProps } = useTable<ITimeEntry>({
        initialPageSize:50,
        resource: "time_entries",
    });

    return (
        <Row gutter={[16, 16]}>
            <Col xl={16} lg={12} md={24} sm={24} xs={24}>
                <Card
                    bodyStyle={{
                        padding: 0,
                        // paddingBottom: 0,
                    }}
                >
                    <List
                        breadcrumb={null}
                        title="Time Tracker"
                        headerProps={{
                            style: {
                                'background': 'linear-gradient(.25turn, #defaff, 10%, #a9effd)'
                            },
                        }}
                    >
                        <Form
                            form={form}
                            initialValues={{
                                "id": 'local-' + Math.floor(Date.now() / 1000),
                                "spent_on": dayjs()
                            }}
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 21 }}
                        >
                            <Form.Item label="Hours">
                                <Row gutter={8}>
                                    <Col span={6}>
                                        <Form.Item
                                            label=""
                                            name="hours"
                                            rules={[{
                                                required: true,
                                                message: 'How long have you worked on the task? 0.25 incremental if you submit to Redmine.'
                                            }]}
                                        >
                                            <Input onBlur={onHoursBlur} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={18}>
                                        <Space wrap>
                                            <div style={{ fontSize: '20px', width: 150, textAlign: 'center', background: '#67be23', color: '#fff' }}>
                                                <span>{timerDays}</span>:<span>{timerHours}</span>:<span>{timerMinutes}</span>:<span>{timerSeconds}</span>
                                            </div>
                                            {!timerIsRunning && <Button danger type="primary" shape="round" size="large" onClick={onTimerStart} icon={<PlayCircleOutlined />} />}
                                            {timerIsRunning && <Button type="primary" shape="round" size="large" onClick={onTimerPause} icon={<PauseCircleOutlined />} />}
                                        </Space>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item
                                label="Comments"
                                name="comments"
                                rules={[
                                    {
                                        required: true,
                                        message: 'What are you working on?'
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Project"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Row gutter={8}>
                                    <Col span={20}>
                                        <Form.Item
                                            name="project"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Which project are you working on?'
                                                },
                                            ]}
                                        >
                                            <Cascader
                                                options={level1ProjectOptions}
                                                placeholder="Please select a project"
                                                showSearch={{ filter: filterOptions }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={4}>
                                        <Button
                                            type="primary"
                                            loading={loadings[0]}
                                            onClick={() => enterLoading(0)}
                                            style={{ float: 'right' }}
                                        >
                                            Load Projects
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Item>
                            <Form.Item
                                label="Activity"
                                name="activity_id"
                                rules={[
                                    {
                                        required: true,
                                        message: "What is the activity?"
                                    },
                                ]}
                            >
                                <Select
                                    style={{ width: 200 }}
                                    options={activities}
                                    // onChange={(value) => console.log(value)}
                                    placeholder="Please select an activity"
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                // onSearch={(value) => console.log(value)}
                                />
                            </Form.Item>
                            <Form.Item
                                name="spent_on"
                                label="Spent On"
                                rules={[
                                    { type: 'object' as const, required: true, message: 'Which date were you worked on the task?' }
                                ]}
                            >
                                <DatePicker
                                    style={{ width: 200 }}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Ticket"
                                name="issue_id"
                                rules={[
                                    {
                                        // type: 'number',
                                        message: 'The input is not valid number!',
                                    }
                                ]}
                            >
                                <Input style={{ width: 200 }} />
                            </Form.Item>
                            <Form.Item
                                label="ID"
                                name="id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'ID is required',
                                    }
                                ]}
                            >
                                <Input style={{ width: 200 }} readOnly />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Space wrap>
                                    <Button htmlType="button" onClick={onReset}>
                                        Reset
                                    </Button>
                                    <Tooltip placement="top" title="Submit the time entry to Redmine.">
                                        <Button type="primary" htmlType="button" danger onClick={onSaveToRedmine}>
                                            Save to Redmine
                                        </Button>
                                    </Tooltip>
                                    <Tooltip placement="top" title="Save the time entry in local as the draft.">
                                        <Button type="primary" htmlType="button" onClick={onSaveDraft}>
                                            Save as Draft
                                        </Button>
                                    </Tooltip>
                                </Space>
                            </Form.Item>
                        </Form>
                    </List>
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
                                size={80}
                                icon={<UserOutlined />}
                            // src='https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Kurt&facialHairType=BeardMedium&facialHairColor=Black&clotheType=BlazerShirt&eyeType=Close&eyebrowType=UpDown&mouthType=Default&skinColor=Light'
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
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                <Card
                    title={
                        <Text
                            strong
                        >
                            Draft Time Entries
                        </Text>
                    }
                >
                    <Table dataSource={localTimeEntriesTableData} rowKey="id">
                        <Table.Column 
                            dataIndex="spent_on" 
                            title="Spend On"
                            width={'125px'}
                            render={(value) => {
                                value = dayjs(value).format('YYYY-MM-DD')
                                return value;
                            }}
                        />
                        <Table.Column dataIndex="hours" title="Hours" />
                        <Table.Column dataIndex="activity_id" title="Activity"
                            render={(value) => {
                                let m = activities.filter(obj => {
                                    return obj.value == value
                                });
                                // console.log(m);
                                if (m.length > 0) {
                                    let matchedActivity = m[0];
                                    return matchedActivity.label;
                                }
                                return value;
                            }}
                        />
                        <Table.Column
                            dataIndex="project"
                            title="Project"
                            render={(value) => {
                                if (value) {
                                    let projectNames = [];
                                    let level1Projects = new Array<IProject>();
                                    let savedLevel1Projects = localStorage.getItem(LEVEL1_PROJECTS_KEY) ?? "[]";
                                    level1Projects = JSON.parse(savedLevel1Projects);
                                    let level1Matches = level1Projects.filter(obj => {
                                        return obj.id === value[0]
                                    });
                                    if (level1Matches.length > 0) {
                                        projectNames.push(level1Matches[0].name);
                                    }
                                    let level2Projects = new Array<IProject>();
                                    let savedLevel2Projects = localStorage.getItem(LEVEL2_PROJECTS_KEY) ?? "[]";
                                    level2Projects = JSON.parse(savedLevel2Projects);
                                    let level2Matches = level2Projects.filter(obj => {
                                        return obj.id === value[value.length - 1]
                                    });
                                    if (level2Matches.length > 0) {
                                        projectNames.push(level2Matches[0].name);
                                    }
                                    return projectNames.join("/");
                                }
                                return value;
                            }}
                        />
                        <Table.Column dataIndex="comments" title="Comments" width={'400px'}/>
                        <Table.Column<ITimeEntry>
                            title="Actions"
                            dataIndex="actions"
                            render={(_, record) => {
                                return (
                                    <Space>
                                        <Tooltip placement="top" title="Load to the Time Tracker form to edit.">
                                            <Button type="primary" icon={<EditOutlined />} />
                                        </Tooltip>
                                        <Tooltip placement="top" title="Submit the time entry to Redmine and delete it from the Draft.">
                                            <Button type="primary" icon={<UploadOutlined />} />
                                        </Tooltip>
                                        <Tooltip placement="top" title="Delete the draft time entry.">
                                            <Button danger type="primary" icon={<DeleteOutlined />} />
                                        </Tooltip>
                                    </Space>
                                );
                            }}
                        />
                    </Table>
                </Card>
            </Col>
            <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                <Card
                    bodyStyle={{
                        padding: 0,
                    }}
                    title={
                        <Text strong>
                            Redmine Time Entries
                        </Text>
                    }
                >
                    <Table {...tableProps} rowKey="id">
                        <Table.Column dataIndex="spent_on" title="Spend On" />
                        <Table.Column dataIndex="hours" title="Hours" />
                        <Table.Column dataIndex="activity" title="Activity" render={(value) => `${value.name}`} />
                        <Table.Column
                            dataIndex="project"
                            title="Project"
                            render={(value) => {
                                let level2Projects = new Array<IProject>();
                                let projectNames = new Array();
                                let savedLevel2Projects = localStorage.getItem(LEVEL2_PROJECTS_KEY) ?? "[]";
                                level2Projects = JSON.parse(savedLevel2Projects);
                                let level2Matches = level2Projects.filter(obj => {
                                    return obj.id === value.id
                                });
                                if (level2Matches.length > 0) {
                                    let matchedProject = level2Matches[0];
                                    projectNames = [matchedProject.parent?.name, matchedProject.name];
                                } else {
                                    projectNames = [value.name];
                                }
                                return projectNames.join("/");
                            }}
                        />
                        {/* <Table.Column dataIndex="created_on" title="Create On"/> */}
                        {/* <Table.Column dataIndex="updated_on" title="Update On"/> */}
                        <Table.Column dataIndex="comments" title="Comments" />
                        <Table.Column<ITimeEntry>
                            title="Actions"
                            dataIndex="actions"
                            render={(_, record) => {
                                return (
                                    <Space>
                                        <Tooltip placement="top" title="Load to the Time Tracker form to edit.">
                                            <Button type="primary" icon={<EditOutlined />} />
                                        </Tooltip>
                                        <Tooltip placement="top" title="Delete the draft time entry.">
                                            <Button danger type="primary" icon={<DeleteOutlined />} />
                                        </Tooltip>
                                    </Space>
                                );
                            }}
                        />
                    </Table>
                </Card>
            </Col>
        </Row>
    );
};