import { useShow, useOne, IResourceComponentsProps } from "@pankod/refine-core";

import { Show, Typography, Tag } from "@pankod/refine-antd";
import { Badge, Descriptions } from 'antd';
import { ITimeEntry, IProject } from "../../interfaces";

const { Title, Text } = Typography;

export const TimeEntryShow: React.FC<IResourceComponentsProps> = () => {
    const { queryResult } = useShow<ITimeEntry>();
    const { data, isLoading } = queryResult;
    const record = data?.data;
    console.log(record);
    return (
        <Show isLoading={isLoading}>
            <Descriptions title="Time Entry" 
                bordered
                // layout="vertical"
                column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>
                <Descriptions.Item label="Spent On">{record?.spent_on}</Descriptions.Item>
                <Descriptions.Item label="Hours">{record?.hours}</Descriptions.Item>
                <Descriptions.Item label="Project ID">{record?.project.id}</Descriptions.Item>
                <Descriptions.Item label="Project Name" span={2}>{record?.project.name}</Descriptions.Item>
                <Descriptions.Item label="Activity ID">{record?.activity.id}</Descriptions.Item>
                <Descriptions.Item label="Activity Name" span={2}>{record?.activity.name}</Descriptions.Item>
                <Descriptions.Item label="Comments" span={3}>{record?.comments}</Descriptions.Item>
                <Descriptions.Item label="User ID">{record?.user.id}</Descriptions.Item>
                <Descriptions.Item label="User Name" span={2}>{record?.user.name}</Descriptions.Item>
                <Descriptions.Item label="Created On">{record?.created_on}</Descriptions.Item>
                <Descriptions.Item label="Updated On" span={2}>{record?.updated_on}</Descriptions.Item>
            </Descriptions>
        </Show>
    );
};