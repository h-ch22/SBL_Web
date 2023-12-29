class ProjectDataModel{
    constructor(id, beginDate, endDate, contents, agency, budget, budgetUnit){
        this.id = id;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.contents = contents;
        this.agency = agency;
        this.budget = budget;
        this.budgetUnit = budgetUnit;
    }
}

export{
    ProjectDataModel
}