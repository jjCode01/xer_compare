import Change from "./data/change.js";
import { formatDate, formatVariance, formatPercent, formatCost, formatNumber, dateVariance, getWeekday } from "./utilities.js";

export let updates = {
    started: new Change(
        "ud-started", 'Activities Started',
        ['Act ID', 'Act Name', 'Status', 'Start', 'Finish'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, 
                formatDate(task.start), formatDate(task.finish)
            ])
        }
    ),
    finished: new Change(
        "ud-finished", "Activities Finished",
        ['Act ID', 'Act Name', 'Status', 'Start', 'Finish'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.start), 
                formatDate(task.finish)
            ])
        }
    ),
    startFinish: new Change(
        "ud-startFinish", "Activities Started and Finished",
        ['Act ID', 'Act Name', 'Status', 'Start', 'Finish'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.start), 
                formatDate(task.finish)
            ])
        }
    ),
    percent: new Change(
        "ud-percent", "Updated Percent Completes",
        ['Act ID', '', 'Act Name', 'Percent\r\nType', '% Comp', 'Prev\r\n% Comp', 'Var'],
        function() {
            return this.data.map((task, i) => [
                task.task_code, task.img, task.task_name, task.percentType, 
                formatPercent(task.percent), formatPercent(this.prev[i].percent), 
                formatPercent(task.percent - this.prev[i].percent, 'always')
            ])
        }
    ),
    duration: new Change(
        "ud-duration", "Updated Remaining Durations",
        [
            'Act ID', '', 'Act Name', 'Orig Dur', 
            'Rem Dur', 'Prev\r\nRem Dur', 'Var'
        ],
        function() {
            return this.data.map((task, i) => [
                task.task_code, task.img, task.task_name, formatNumber(task.origDur), 
                formatNumber(task.remDur), formatNumber(this.prev[i].remDur), 
                formatVariance(task.remDur - this.prev[i].remDur)
            ])
        }
    ),
    cost: new Change(
        "ud-cost", "Updated Actual Cost",
        [
            'Act ID', '', 'Act Name', 'Budgeted Cost', 
            'Actual Cost', 'Prev\r\nActual Cost', 'Var'
        ],
        function() {
            return this.data.map((task, i) => [
                task.task_code, task.img, task.task_name, formatCost(task.budgetCost), 
                formatCost(task.actualCost), formatCost(this.prev[i].actualCost), 
                formatCost(task.actualCost - this.prev[i].actualCost)
            ])
        }
    ),
    regress: new Change(
        "ud-regress", "Regressive Updates",
        [
            'Act ID', '', 'Act Name', 'Orig Dur', 
            'Rem Dur', 'Prev\r\nRem Dur', 'RD Var', '% Comp', 
            'Prev\r\n% Comp', '% Var'
        ],
        function() {
            return this.data.map((task, i) => [
                task.task_code, task.img, task.task_name, task.origDur, 
                task.remDur, this.prev[i].remDur, 
                formatVariance(task.remDur - this.prev[i].remDur),
                formatPercent(task.percent), formatPercent(this.prev[i].percent), 
                formatPercent(task.percent - this.prev[i].percent, 'always')
            ])
        }
    )
}

export let constraintVariance = new Change(
    "cnst-var", "Finish Constraint Trending",
    [
        'Act ID', '', 'Act Name', 'Constraint',
        'Current\r\nFinish', 'Float', 'Previous\r\nFinish', 'Variance'
    ],
    function() {
        return this.data.map((task, i) => {
            // if (projects.previous.has(task)) {
            //     return [
            //         task.task_code, task.img, task.task_name, formatDate(task.cstr_date, false), 
            //         formatDate(task.finish, false), formatVariance(task.totalFloat), 
            //         formatDate(projects.previous.get(task).finish, false),
            //         formatVariance(dateVariance(projects.previous.get(task).finish, task.finish))
            //     ]
            // }
            return [
                task.task_code, task.img, task.task_name, formatDate(task.cstr_date, false), 
                formatDate(task.finish, false), formatVariance(task.totalFloat), 
                formatDate(this.prev[i]?.finish, false) ?? "N/A", 
                formatVariance(dateVariance(this.prev[i]?.finish, task.finish)) ?? "N/A"
            ]
        })
    }
)

export let constraintChanges = {
    addedPrim: new Change(
        "cs-added-prim", "Added Primary Constraints",
        ['Act ID', '', 'Activity Name', 'Constraint', 'Date'],
        function() {
            return this.data.map(task => [
                task.task_code, task.img, task.task_name,
                task.primeConstraint, formatDate(task.cstr_date) ?? ""
            ])
        }
    ),
    addedSec: new Change(
        "cs-added-sec", "Added Secondary Constraints",
        ['Act ID', '', 'Activity Name', 'Constraint', 'Date'],
        function() {
            return this.data.map(task => [
                task.task_code, task.img, task.task_name,
                task.secondConstraint, formatDate(task.cstr_date2) ?? ""
            ])
        }
    ),
    deletedPrim: new Change(
        "cs-deleted-prim", "Deleted Primary Constraints",
        ['Act ID', '', 'Activity Name', 'Constraint', 'Date'],
        function() {
            return this.data.map(task => [
                task.task_code, task.img, task.task_name,
                task.primeConstraint, formatDate(task.cstr_date) ?? ""
            ])
        }
    ),
    deletedSec: new Change(
        "cs-deleted-sec", "Deleted Secondary Constraints",
        ['Act ID', '', 'Activity Name', 'Constraint', 'Date'],
        function() {
            return this.data.map(task => [
                task.task_code, task.img, task.task_name,
                task.secondConstraint, formatDate(task.cstr_date2) ?? ""
            ])
        }
    ),
    revisedPrim: new Change(
        "cs-revised-prim", "Revised Primary Constraint Dates",
        ['Act ID', '', 'Activity Name', 'Constraint', 'New Date', 'Old Date', 'Var'],
        function() {
            return this.data.map((task, i) => {
                const variance = dateVariance(task.cstr_date, this.prev[i].cstr_date) ?? "N/A"
                return [
                    task.task_code, task.img, task.task_name, task.primeConstraint, 
                    formatDate(task.cstr_date), formatDate(this.prev[i].cstr_date), 
                    formatVariance(variance)
                ]
            })
        }
    ),
    revisedSec: new Change(
        "cs-revised-sec", "Revised Secondary Constraint Dates",
        ['Act ID', '', 'Activity Name', 'Constraint', 'New Date', 'Old Date', 'Var'],
        function() {
            return this.data.map((task, i) => {
                const variance = dateVariance(task.cstr_date2, this.prev[i].cstr_date2) ?? "N/A"
                return [
                    task.task_code, task.img, task.task_name, task.secondConstraint, 
                    formatDate(task.cstr_date2), formatDate(this.prev[i].cstr_date2), 
                    formatVariance(variance)
                ]
            })
        }
    ),
}

let openEnds = {
    predecessor: new Change(
        "open-pred", "Activities With No Predecessor",
        ['Act ID', 'Activity Name', 'Status', 'Type'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, task.taskType
            ])
        }
    ),
    successor: new Change(
        "open-succ", "Activities With No Successor",
        ['Act ID', 'Activity Name', 'Status', 'Type'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, task.taskType
            ])
        }
    ),
    start: new Change(
        "open-start", "Activities With No Start (SS or FS) Predecessor",
        ['Act ID', 'Activity Name', 'Status', 'Type'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, task.taskType
            ])
        }
    ),
    finish: new Change(
        "open-finish", "Activities With No Finish (FS or FF) Successor",
        ['Act ID', 'Activity Name', 'Status', 'Type'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, task.taskType
            ])
        }
    ),
    duplicate: new Change(
        "open-duplicate", "Duplicate Relationships",
        ['Pred ID', 'Predecessor Name', 'Succ ID', 'Successor Name', "Link:Lag", "Duplicate\r\nLink:Lag"],
        function() {
            return this.data.map(task => [
                task[0].predTask.task_code, task[0].predTask.task_name, 
                task[0].succTask.task_code, task[0].succTask.task_name,
                `${task[0].link}:${task[0].lag}`, `${task[1].link}:${task[1].lag}`
            ])
        }
    )
}

let dateWarnings = {
    start: new Change(
        "inv-start", "Activities With Actual Start on or After Data Date",
        ['Act ID', 'Activity Name', 'Status', 'Actual\r\nStart',],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.start), 
            ])
        }
    ),
    finish: new Change(
        "inv-finish", "Activities With Actual Finish on or After Data Date",
        ['Act ID', 'Activity Name', 'Status', 'Actual\r\nFinish',],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.finish), 
            ])
        }
    ),
    expected: new Change(
        "inv-expected", "Activities With an Expected Finish Date",
        ['Act ID', 'Activity Name', 'Status', 'Expected\r\nFinish', 'Orig\r\nDur', 'Rem\r\nDur'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.expect_end_date), 
                formatNumber(task.origDur), formatNumber(task.remDur)
            ])
        }
    ),
    suspend: new Change(
        "inv-suspend", "Activities With Suspend / Resume Dates",
        ['Act ID', 'Activity Name', 'Status', 'Suspend', 'Resume'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.status, formatDate(task.suspend_date), 
                formatDate(task.resume_date)
            ])
        }
    )
}

let durWarnings = {
    long: new Change(
        "dur-long", "Construction Activities With Original Durations Greater than 20 Days",
        ['Act ID', 'Activity Name', 'Act Type', 'Status', 'Cal', 'Orig\r\nDur'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.taskType, task.status, 
                task.calendar.clndr_name, task.origDur
            ])
        }
    ),
    zero: new Change(
        "dur-zero", "Activities With Original Durations Equal to 0 Days",
        ['Act ID', 'Activity Name', 'Act Type', 'Status', 'Cal', 'Orig\r\nDur'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.taskType, task.status, 
                task.calendar.clndr_name, task.origDur
            ])
        }
    ),
    rdzero: new Change(
        "dur-rdzero", "Open Activities with Zero Remaining Duration",
        ['Act ID', 'Activity Name', 'Act Type', 'Status', 'Cal', 'Orig\r\nDur', 'Rem\r\nDur'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.taskType, task.status, 
                task.calendar.clndr_name, task.origDur, task.remDur
            ])
        }
    ),
    odrd: new Change(
        "dur-odrd", "Open Activities With Unequal Original and Remaining Durations",
        ['Act ID', 'Activity Name', 'Act Type', 'Status', 'Cal', 'Orig\r\nDur', 'Rem\r\nDur'],
        function() {
            return this.data.map(task => [
                task.task_code, task.task_name, task.taskType, task.status, 
                task.calendar.clndr_name, task.origDur, task.remDur
            ])
        }
    )
}

let costWarnings = {
    budget: new Change(
        "cost-budget", "Budgeted Cost Differs from At Completion Cost",
        [
            'Act ID', 'Activity Name', 'Status', 'Resource', 'Budgeted\r\nCost', 
            'At Completion\r\nCost', 'Variance'
        ],
        function() {
            return this.data.map(res => {
                return [
                    res.task.task_code, res.task.task_name, res.task.status, 
                    res.rsrcName, formatCost(res.target_cost), formatCost(res.atCompletionCost), 
                    formatCost(res.atCompletionCost - res.target_cost)
                ]
            })
        }
    ),
    earned: new Change(
        "cost-ev", "Actual Cost to Date Differs from Earned Value",
        ['Act ID', 'Activity Name', 'Status', 'Resource', '%\r\nComp', 
         'Actual\r\nCost', 'Earned\r\nValue', 'Variance'],
        function() {
            return this.data.map(res => {
                return [
                    res.task.task_code, res.task.task_name, res.task.status, 
                    res.rsrcName, formatPercent(res.task.percent), formatCost(res.actualCost), 
                    formatCost(res.earnedValue), formatCost(res.actualCost - res.earnedValue)
                ]
            })
        }
    ),
    regress: new Change(
        "cost-regress", "Regressive This Period Cost",
        [
            'Act ID', 'Activity Name', 'Status', 
            'Resource', 'Budgeted\r\nCost', 'This Period\r\nCost'
        ],
        function() {
            return this.data.map(res => {
                return [
                    res.task.task_code, res.task.task_name, res.task.status, 
                    res.rsrcName, formatCost(res.target_cost), formatCost(res.act_this_per_cost)
                ]
            })
        }
    )
}

export let plannedProgress = {
    earlyStart: 0,
    lateStart: 0,
    earlyFinish: 0,
    lateFinish: 0,
}
