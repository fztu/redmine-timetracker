import axios, { AxiosInstance } from "axios";
import { DataProvider, CrudOperators, CrudSorting, CrudFilters } from "@pankod/refine-core";
import { stringify } from "query-string";
import { IProject } from "../../interfaces";
import { json } from "node:stream/consumers";

const axiosInstance = axios.create();

const TOKEN_KEY = process.env.REACT_APP_REDMINE_TOKEN_KEY ?? "redmine_api_key";
const ALL_PROJECTS_KEY = process.env.REACT_APP_REDMINE_ALL_PROJECTS_KEY ?? "redmine_projects";
const LEVEL1_PROJECTS_KEY = process.env.REACT_APP_REDMINE_LEVEL1_PROJECTS_KEY ?? "redmine_projects_level1";
const LEVEL2_PROJECTS_KEY = process.env.REACT_APP_REDMINE_LEVEL2_PROJECTS_KEY ?? "redmine_projects_level2";

const token = localStorage.getItem(TOKEN_KEY);
if (token) {
    axiosInstance.defaults.headers.common = {
        'X-Redmine-API-Key': `${token}`,
    };
}

const generateSort = (sort?: CrudSorting) => {
    let _sort = ["id"]; // default sorting field
    let _order = ["desc"]; // default sorting

    if (sort) {
        _sort = [];
        _order = [];

        sort.map((item) => {
            _sort.push(item.field);
            _order.push(item.order);
        });
    }

    return {
        _sort,
        _order,
    };
};

const mapOperator = (operator: CrudOperators): string => {
    switch (operator) {
        case "ne":
        case "gte":
        case "lte":
            return `_${operator}`;
        case "contains":
            return "_like";
    }

    return ""; // default "eq"
};

const generateFilter = (filters?: CrudFilters) => {
    const queryFilters: { [key: string]: string } = {};

    if (filters) {
        filters.map((filter) => {
            if (filter.operator === "or" || filter.operator === "and") {
                throw new Error(
                    `[@pankod/refine-simple-rest]: \`operator: ${filter.operator}\` is not supported. You can create custom data provider. https://refine.dev/docs/api-reference/core/providers/data-provider/#creating-a-data-provider`,
                );
            }

            if ("field" in filter) {
                const { field, operator, value } = filter;

                if (field === "q") {
                    queryFilters[field] = value;
                    return;
                }

                const mappedOperator = mapOperator(operator);
                queryFilters[`${field}${mappedOperator}`] = value;
            }
        });
    }

    return queryFilters;
};


const getAllProjects = async (
    apiUrl: string,
    httpClient: AxiosInstance = axiosInstance,
) => {
    const cachedAllProjects = localStorage.getItem(ALL_PROJECTS_KEY);
    var allProjects = new Array<IProject>();
    if (cachedAllProjects) {
        allProjects = JSON.parse(cachedAllProjects);
    } else {
        const url = `${apiUrl}/projects.json`;
        const pageSize = 100;
        let retrieved = 0;
        let totalCount = 0;
        let query = {
            offset: retrieved,
            limit: pageSize
        };
        let result = await httpClient.get(
            `${url}?${stringify(query)}`,
        );
        totalCount = result?.data?.total_count;
        // totalCount = 525;
        console.log(result?.data?.projects.length);
        allProjects = allProjects.concat(result?.data?.projects);
        while (retrieved < totalCount) {
            retrieved += result?.data?.projects.length;
            query = {
                offset: retrieved,
                limit: pageSize
            };
            result = await httpClient.get(
                `${url}?${stringify(query)}`,
            );
            allProjects = allProjects.concat(result?.data?.projects);
        }
        if (allProjects.length > 0) {
            let activeProjects = allProjects.filter(p => p.status == 1);
            let level1Projects = new Array<IProject>();
            let level2Projects = new Array<IProject>();
            activeProjects.forEach((p, idx) => {
                console.log(p);
                if (p.parent) {
                    level2Projects.push(p);
                    let parents = level1Projects.filter(obj => {
                        return obj.id === p.parent?.id
                    });
                    if (parents.length == 0) {
                        let parents = activeProjects.filter(obj => {
                            return obj.id === p.parent?.id
                        });
                    }
                    let parent = parents.length ? parents[0] : null;
                    if (parent) {
                        let child = {
                            id: p.id,
                            name: p.name
                        };
                        if (parent.children) {
                            parent.children.push(child);
                        } else {
                            parent.children = [child];
                        }
                    }
                } else {
                    level1Projects.push(p);
                }
            });
            localStorage.setItem(ALL_PROJECTS_KEY, JSON.stringify(activeProjects));
            localStorage.setItem(LEVEL1_PROJECTS_KEY, JSON.stringify(level1Projects));
            localStorage.setItem(LEVEL2_PROJECTS_KEY, JSON.stringify(level2Projects));
        }
    }
};

export const RedmineDataProvider = (
    apiUrl: string,
    httpClient: AxiosInstance = axiosInstance,
): DataProvider => ({
    create: async ({ resource, variables }) => {
        const url = `${apiUrl}/${resource}.json`;

        const { data } = await httpClient.post(url, variables);

        return {
            data,
        };
    },
    createMany: async ({ resource, variables }) => {
        const response = await httpClient.post(
            `${apiUrl}/${resource}/bulk`,
            { values: variables },
        );

        return response;
    },
    deleteOne: async ({ resource, id }) => {
        const url = `${apiUrl}/${resource}/${id}`;

        const { data } = await httpClient.delete(url);

        return {
            data,
        };
    },
    deleteMany: async ({ resource, ids }) => {
        const response = await httpClient.delete(
            `${apiUrl}/${resource}/bulk?ids=${ids.join(",")}`,
        );
        return response;
    },
    update: async ({ resource, id, variables }) => {
        const url = `${apiUrl}/${resource}/${id}`;

        const { data } = await httpClient.patch(url, variables);

        return {
            data,
        };
    },
    updateMany: async ({ resource, ids, variables }) => {
        const response = await httpClient.patch(
            `${apiUrl}/${resource}/bulk`,
            { ids, variables },
        );
        return response;
    },
    getOne: async ({ resource, id }) => {
        const url = `${apiUrl}/${resource}/${id}.json`;

        const { data } = await httpClient.get(url);
        
        let record = data;
        if (resource === "time_entries") {
            record = data?.time_entry;
        }
        return {
            data: record
        };
    },
    getMany: async ({ resource, ids }) => {
        const { data } = await httpClient.get(
            `${apiUrl}/${resource}?${stringify({ id: ids })}`,
        );

        return {
            data,
        };
    },
    getList: async ({ resource, hasPagination = true, pagination, filters, sort }) => {
        const url = `${apiUrl}/${resource}.json`;

        const current = pagination?.current || 1;
        const pageSize = pagination?.pageSize || 25;

        const { _sort, _order } = generateSort(sort);

        const queryFilters = generateFilter(filters);

        const user = localStorage.getItem("redmine_user");
        let userId = null;
        if (user) {
            userId = JSON.parse(user).id;
        }

        const query = {
            ...(hasPagination ? {
                offset: (current - 1) * pageSize,
                limit: pageSize,
            } : {}),
            ... (userId ? {
                user_id: userId
            } : {}),
            _sort: _sort.join(","),
            _order: _order.join(","),
        };

        const { data } = await httpClient.get(
            `${url}?${stringify(query)}&${stringify(queryFilters)}`,
        );

        if (resource == 'time_entries') {
            await getAllProjects(apiUrl, httpClient);
        }

        const total = data['total_count'];
        const items = data[`${resource}`];

        return {
            data: items,
            total: total,
        };
    },
    getApiUrl: () => "",
});