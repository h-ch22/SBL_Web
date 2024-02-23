class PublicationDataModel{
    constructor(id, year, title, authors, journalName, journal, url){
        this.id = id;
        this.year = year;
        this.title = title;
        this.authors = authors;
        this.journalName = journalName;
        this.journal = journal
        this.url = url
    }
}

export{
    PublicationDataModel
}