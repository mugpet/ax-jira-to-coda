var xlsx = require("node-xlsx")
var fetch = require("node-fetch")
const yargs = require("yargs")
const fs = require("fs")

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; // works - disables SSL certificate check (localhost)


const options = {
  "jira-token": {
    alias: "t",
    description: "Jira Token for the API call must have write access",
    required: true,
  },
  "coda-token": {
    alias: "j",
    description: "Coda Token for the API call must have write access",
    required: true,
    type: "string",
  },
  "board-id": {
    alias: "b",
    description: "Jira Board ID",
    required: true,
    type: "string",
  },
  "page-id": {
    alias: "p",
    description: "Coda page/doc Id",
    required: true,
    type: "string",
  },
  "table-id": {
    alias: "g",
    description: "Coda table/grid Id",
    required: true,
    type: "string",
  },
  "table-type": {
    alias: "e",
    description: 'Table type like "epic" and "Issues"',
    required: true,
    type: "string",
  },
  "json-file": {
    alias: "s",
    description: 'JsonFilename "',
    type: "string",
  },
}

const argv = yargs
  .command("upload", "Will upload AX .xlsx file to Coda.io", {
    year: {
      description: "the year to check for",
      alias: "y",
      type: "number",
    },
  })
  .option(options)
  .help()
  .alias("help", "h").argv

if (argv.time) {
  console.log("The current time is: ", new Date().toLocaleTimeString())
}

console.log(argv)

const jiraToken = argv.jiraToken // 'NjI3NDk1NzMwNDcxOlHf3oyuXlRCuiwxzd0lPdUAS4ja'
const codaToken = argv.codaToken // '12ab4adf-e79f-4a87-b6b5-493314c8f9ff' // RSJ

const getJiraData = async (boardId, type, params) => {
  const url = `https://support.innofactor.com/rest/agile/1.0/board/${boardId}/${type}?${params}`
  const headers = {
    "Content-Type": "application/json",
    authorization: `Bearer ${jiraToken}`
  }

  const dataResp = await fetch(url, {
    method: "GET",
    headers,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  })

  const data = await dataResp.json()

  return data
}

const updateCodaTable = (pageId, tableId, rows) => {
  // get table list
  fetch(`https://coda.io/apis/v1/docs/${pageId}/tables/${tableId}/rows`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${codaToken}`,
    }
  })
    .then((r) => r.json())
    .then((res) => {
      // console.log('res:', res)
      const data = [...res.items]
      const rowsToDelete = data.map((r) => {
        return r.id
      })

      const content = {
        rowIds: rowsToDelete,
      }

      // Delete fetched rows
      fetch(`https://coda.io/apis/v1/docs/${pageId}/tables/${tableId}/rows`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${codaToken}`,
        },
        body: JSON.stringify(content),
      }).then((r) => {
        console.log("delete order sent!")

        // wait 1 second before adding new fields
        setTimeout(() => {
          //  Update table
          const content = {
            rows: rows,
            // keyColumns: ['Activity number'],
          }

          // console.log('content: ', JSON.stringify(content, null, 2))
          const url = `https://coda.io/apis/v1/docs/${pageId}/tables/${tableId}/rows?valueFormat=simple&useColumnNames=true`
          // Add new rows
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${codaToken}`,
            },
            body: JSON.stringify(content),
          })
            .then((res) => {
              console.log("res:", res)
              console.log("upsert done!")
            })
            .catch((err) => {
              console.log("ERROR:", err.message)
            })
        }, 2000)
      })
    })
}


const syncjiraIssuesData = async (pageId, boardId, tableId) => {
  const jiraData = await getJiraData(boardId, "issue", 'maxResults=1000&fields="key,status,resolution,assignee,creator,project,description,summary,epic,issuetype,customfield_10010,customfield_10108,customfield_10109,priority,"')
  
  console.log("JiraData:", JSON.stringify(jiraData.issues[1], null, 2)) 

  const rows = jiraData.issues.map((d) => {
    // console.log("issue type:", d.fields.issuetype && d.fields.issuetype.name)
    // const jiraUrl = `https://support.innofactor.com/secure/RapidBoard.jspa?rapidView=${boardId}&view=detail&selectedIssue=${d.key}`
    const jiraUrl = `https://support.innofactor.com/browse/${d.key}`

    return {
      cells: [
        { column: "id", value: d.id },
        { column: "key", value: d.key },
        { column: "self", value: d.self },
        { column: "name", value: d.fields && d.fields.customfield_10010 ? d.fields.customfield_10010 : "" },
        { column: "summary", value: d.fields && d.fields.summary ? d.fields.summary : "" },
        { column: "description", value: d.fields && d.fields.description ? d.fields.description : "" },
        { column: "Assignee", value: d.fields.assignee && d.fields.assignee.displayName ? d.fields.assignee.displayName : "" },
        { column: "Assignee emailAddress", value: d.fields.assignee && d.fields.assignee.emailAddress ? d.fields.assignee.emailAddress : "" },
        { column: "Status", value: d.fields.status && d.fields.status.name ? d.fields.status.name : "" },
        { column: "Creator", value: d.fields.creator && d.fields.creator.displayName ? d.fields.creator.displayName : "" },        
        { column: "Issue Type", value: d.fields.issuetype && d.fields.issuetype.name ? d.fields.issuetype.name : "" },        
        { column: "Estimated Hours", value: d.fields.customfield_10108 ? d.fields.customfield_10108 : "" },        
        { column: "Revised Hours", value: d.fields.customfield_10109 ? d.fields.customfield_10109 : "" },        
        { column: "Priority", value: d.fields.priority && d.fields.priority.name  ? d.fields.priority.name : "" },        
        { column: "EpicKey", value: d.fields.epic && d.fields.epic.key ? d.fields.epic.key : "" },
        { column: "JiraUrl", value: jiraUrl },
      ],
    }
  })

  // Add 'Andet' for hours without jira
  rows.push ({ cells: [
    // { column: "id", value: d.id },
    // { column: "key", value: d.key },
    // { column: "self", value: d.self },
    // { column: "name", value: d.fields && d.fields.customfield_10010 ? d.fields.customfield_10010 : "" },
    { column: "summary", value: "N/A" },
    // { column: "description", value: d.fields && d.fields.description ? d.fields.description : "" },
    // { column: "Assignee", value: d.fields.assignee && d.fields.assignee.displayName ? d.fields.assignee.displayName : "" },
    // { column: "Assignee emailAddress", value: d.fields.assignee && d.fields.assignee.emailAddress ? d.fields.assignee.emailAddress : "" },
    // { column: "Status", value: d.fields.status && d.fields.status.name ? d.fields.status.name : "" },
    // { column: "Creator", value: d.fields.creator && d.fields.creator.displayName ? d.fields.creator.displayName : "" },        
    { column: "Issue Type", value: "Item" },        
    // { column: "Estimated Hours", value: d.fields.customfield_10108 ? d.fields.customfield_10108 : "" },        
    // { column: "Revised Hours", value: d.fields.customfield_10109 ? d.fields.customfield_10109 : "" },        
    // { column: "Priority", value: d.fields.priority && d.fields.priority.name  ? d.fields.priority.name : "" },        
    // { column: "EpicKey", value: d.fields.epic && d.fields.epic.key ? d.fields.epic.key : "" },
    // { column: "JiraUrl", value: jiraUrl },
  ]}
)


  console.log("1st row:", JSON.stringify(rows[0],null,2))

  if (argv.jsonFile) {
    // create for file save
    const fileRows = jiraData.issues
    .filter(i => i.fields && i.fields.issuetype.name == "Epic")
    .map((d) => {
      return {
        "key":  d.key,
        "self": d.self,
        "status": d.fields.status && d.fields.status.name ? d.fields.status.name : "",
        "name": d.fields && d.fields.customfield_10010 ? d.fields.customfield_10010 : "",
        "summary": d.fields && d.fields.summary ? d.fields.summary : "",
        "description": d.fields && d.fields.description ? d.fields.description : "",
        "estimatedHours":  d.fields.customfield_10108 ? d.fields.customfield_10108 : "",
        "revisedHours":  d.fields.customfield_10109 ? d.fields.customfield_10109 : ""
      }
    })

    // save to file
    fs.writeFileSync(argv.jsonFile, JSON.stringify(fileRows))
  }




  updateCodaTable(pageId, tableId, rows)
}

const pageId = argv.pageId // aka doc id
const tableId = argv.tableId

if (argv.tableType == "issue") {
  syncjiraIssuesData(pageId, argv.boardId, tableId)
} else if (argv.tableType == "epic") {
  syncjiraEpicData(pageId, argv.boardId, tableId)
} else {
  console.log("Jira type not found!")
}
