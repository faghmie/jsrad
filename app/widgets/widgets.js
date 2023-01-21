import forms from './forms/index.js';
import charts from './charts/index.js';
import general from './shapes/index.js';
import lines from './lines/index.js';
import special from './special/index.js';
import common_activities from './code-snippets/common/index.js';
import data_parsing from './code-snippets/data-parsing/index.js';
import finance from './code-snippets/finance/index.js';
import flow_activities from './code-snippets/process-flow/index.js';
import ui from './code-snippets/user-interface/index.js';
import webapi from './code-snippets/web-service/index.js';

export default [...forms, ...charts, ...general, ...special, ...common_activities, ...flow_activities,
...finance, ...data_parsing,...ui, ...webapi, ...lines];
