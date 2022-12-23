export interface ITimeEntry {
    id: number;
    project: {
        id: number;
        name:  string
    };
    user: {
        id: number;
        name: string
    };
    activity: {
        id: number;
        name: string
    };
    hours: number;
    comments: string;
    spent_on: string;
    created_on: string;
    updated_on: string
}

export interface IProjectBasic {
    id: number;
    name: string;
}

export interface IProject {
    id: number;
    name: string;
    identifier: string;
    description: string;
    status: number;
    parent: IProjectBasic | null;
    children: IProjectBasic[];
    custom_fields: IProjectCustomField[];
}

export interface IProjectCustomField {
    id: number;
    name: string;
    value: string;
}