import {
    List,
    TextField,
    TagField,
    DateField,
    Space,
    EditButton,
    ShowButton,
    DeleteButton,
    Table,
    useTable,
} from "@pankod/refine-antd";
import { 
    useList,
    useDataProvider
} from "@pankod/refine-core";

import { ITimeEntry, IProject } from "../../interfaces";


export const TimeEntryList: React.FC = () => {
    const { tableProps } = useTable<ITimeEntry>({
        initialPageSize:50
    });

    return (
        <List>
            <Table {...tableProps} rowKey="id">
                {/* <Table.Column dataIndex="id" title="ID" /> */}
                {/* <Table.Column dataIndex="user" title="User" render={(value) => `${value.name}`} /> */}
                <Table.Column dataIndex="spent_on" title="Spend On"/>
                <Table.Column dataIndex="hours" title="Hours" />
                <Table.Column dataIndex="activity" title="Activity" render={(value) => `${value.name}`} />
                <Table.Column 
                    dataIndex="project" 
                    title="Project" 
                    render={(value) => {
                        const level2ProjectsKey = "redmine_projects_level2";
                        let level2Projects = new Array<IProject>();
                        let savedLevel2Projects = localStorage.getItem(level2ProjectsKey) ?? "[]";
                        level2Projects = JSON.parse(savedLevel2Projects);
                        let level2Matches = level2Projects.filter(obj => {
                            return obj.id === value.id
                        });
                        if (level2Matches.length > 0 ) {
                            let matchedProject = level2Matches[0];
                            return <TextField value={matchedProject.parent?.name} />;
                        }
                        return <TextField value={value.name} />;
                    }} 
                />
                <Table.Column 
                    dataIndex="project" 
                    title="Sub Project" 
                    render={(value) => {
                        const level1ProjectsKey = "redmine_projects_level1";
                        let level1Projects = new Array<IProject>();
                        let savedLevel1Projects = localStorage.getItem(level1ProjectsKey) ?? "[]";
                        level1Projects = JSON.parse(savedLevel1Projects);
                        // console.log(level1Projects);
                        let level1Matches = level1Projects.filter(obj => {
                            return obj.id === value.id
                        });
                        if (level1Matches.length >0 ) {
                            return "";
                        }
                        return <TextField value={value.name} />;
                    }} 
                />                
                {/* <Table.Column dataIndex="created_on" title="Create On"/> */}
                {/* <Table.Column dataIndex="updated_on" title="Update On"/> */}
                <Table.Column dataIndex="comments" title="Comments"/>
                <Table.Column<ITimeEntry>
                    title="Actions"
                    dataIndex="actions"
                    render={(_, record) => {
                        return (
                            <Space>
                                <ShowButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                                <EditButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                                <DeleteButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                            </Space>
                        );
                    }}
                />
            </Table>
        </List>
    );
};