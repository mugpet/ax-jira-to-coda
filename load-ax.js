var xlsx = require('node-xlsx')
var fetch = require('node-fetch')
const yargs = require('yargs');

const options = {
  'coda-token': {
  alias: 't',
  description: 'Coda Token for the API call must have write access',
  required: true,
  type: 'string'},
  'ax-file': {
    alias: 'f',
    description: 'Excel file downloaded from AX',
    required: true,
    type: 'string'},
  'page-id': {
    alias: 'p',
    description: 'Coda page/doc Id',
    required: true,
    type: 'string'},
  'table-id': {
    alias: 'g',
    description: 'Coda table/grid Id',
    required: true,
    type: 'string'},
  'ax-type': {
    alias: 'x',
    description: 'pending og done',
    type: 'string'},
}


const argv = yargs
  .command('upload', 'Will upload AX .xlsx file to Coda.io', {
    year: {
      description: 'the year to check for',
      alias: 'y',
      type: 'number'
    }
  })
  .option(options)
  .help()
  .alias('help', 'h').argv;

if (argv.time) {
  console.log('The current time is: ', new Date().toLocaleTimeString());
} 
  console.log(argv);



var obj = xlsx.parse(argv.axFile) 
const columns = obj[0].data[0]
const data = obj[0].data.slice(1)

// console.log('data:', data)
console.table(columns)


const rows = data.map((d) => {
  // Extract hours from description

  const description = argv.axType == "pending" 
  ? d[8] ? d[8] : ''
  : d[7] ? d[7] : ''

  let objList = []
  if (description != '') {
    const foundJiraCodes = description.match(/(?:[a-zA-Z]*)-\d{1,}[\s|-]\d{1,3}([.|,]?\d{1,2})?h/gm)

    objList =
      foundJiraCodes && foundJiraCodes.length > 0
        ? foundJiraCodes.map((o) => {
            const hours = o.match(/(?:[\d|.|,])*(?=h)/gm)
            const hoursToDot = hours[0].replace(',', '.')
            const key = o.match(/.*(?=[-|\s](?:[\d|.|,])*h)/gm)

            return key && key.length > 0 && hoursToDot != ""
              ? { key: key[0], hours: hoursToDot }
              : false
          })
        : []
  }


  const row = argv.axType == "pending" 
  ? {
    cells: [
      { column: 'Date', value: new Date(Date.UTC(0, 0, d[0] - 1)) },
      { column: 'Customer account', value: d[1] },
      { column: 'Name', value: d[2] },
      { column: 'Project name', value: d[3] },
      { column: 'Project ID', value: d[4] },
      { column: 'Activity number', value: d[6] },
      { column: 'Activity', value: d[7] },
      { column: 'Description', value: d[8] },
      { column: 'Internal comment', value: d[9] },
      { column: 'Department', value: d[10] },
      { column: 'Resource name', value: d[13] },
      { column: 'Quantity', value: d[15] },
      { column: 'Total sales amount', value: 0 },
      { column: 'Total cost amount', value: 0 },
      { column: 'Invoice status', value: "" },
      { column: 'Transaction type', value: d[18] },
      { column: 'Expense invoice', value: "" },
      { column: 'Item', value: "" },
      { column: 'Indirect cost component group', value: "" },
      { column: 'Jira Key', value: objList.length > 0 ? objList[0].key : '' },
      { column: 'Jira Hours', value: objList.length > 0 ? objList[0].hours : d[15] },
    ],
  }
  :{
    cells: [
      { column: 'Date', value: new Date(Date.UTC(0, 0, d[0] - 1)) },
      { column: 'Customer account', value: d[1] },
      { column: 'Name', value: d[2] },
      { column: 'Project ID', value: d[3] },
      { column: 'Project name', value: d[4] },
      { column: 'Activity number', value: d[5] },
      { column: 'Activity', value: d[6] },
      { column: 'Description', value: d[7] },
      { column: 'Internal comment', value: d[8] },
      { column: 'Department', value: d[9] },
      { column: 'Resource name', value: d[10] },
      { column: 'Quantity', value: d[11] },
      { column: 'Total sales amount', value: d[12] },
      { column: 'Total cost amount', value: d[13] },
      { column: 'Invoice status', value: d[14] },
      { column: 'Transaction type', value: d[15] },
      { column: 'Expense invoice', value: d[16] },
      { column: 'Item', value: d[17] },
      { column: 'Indirect cost component group', value: d[18] },
      { column: 'Jira Key', value: objList.length > 0 ? objList[0].key : '' },
      { column: 'Jira Hours', value: objList.length > 0 ? objList[0].hours : d[11] },
    ],
  } 

  let conseqRows = []
  if (objList && objList.length >1) {
    console.log("OBjlist:", objList)
    conseqList = objList.slice(1) // remove the first item
    console.log("\n\n\nconseqList:", conseqList)

    conseqList.forEach(o => {
      conseqRows = [...conseqRows, argv.axType == "pending" 
      ? {
        cells: [
          { column: 'Date', value: new Date(Date.UTC(0, 0, d[0] - 1)) },
          { column: 'Customer account', value: d[1] },
          { column: 'Name', value: d[2] },
          { column: 'Project name', value: d[3] },
          { column: 'Project ID', value: d[4] },
          { column: 'Activity number', value: d[6] },
          { column: 'Activity', value: d[7] },
          { column: 'Description', value: `Subitem calculation for JIRA ID: ${o.key}.\nParent quantity ${d[15]}h` },
          { column: 'Resource name', value: d[13] },
          { column: 'Invoice status', value: "" },
          { column: 'Transaction type', value: d[18] },
          { column: 'Jira Key',  value: o.key ? o.key : ''  },
          { column: 'Jira Hours', value: o.hours ? o.hours : 0  },
        ],
      }
    : {
      cells: [
        { column: 'Date', value: new Date(Date.UTC(0, 0, d[0] - 1)) },
        { column: 'Customer account', value: d[1] },
        { column: 'Name', value: d[2] },
        { column: 'Project ID', value: d[3] },
        { column: 'Project name', value: d[4] },
        { column: 'Activity number', value: d[5] },
        { column: 'Activity', value: d[6] },
        { column: 'Description', value: `Subitem calculation for JIRA ID: ${o.key}.\nParent quantity ${d[11]}h` },
        { column: 'Resource name', value: d[10] },
        { column: 'Invoice status', value: d[14] },
        { column: 'Transaction type', value: d[15] },
        { column: 'Jira Key', value: o.key ? o.key : '' },
        { column: 'Jira Hours', value: o.hours ? o.hours : 0 },
      ],
    }
    ]

    })
  }

  return [row,...conseqRows]
})



const updatecoda = () => {
// get table list
fetch(`https://coda.io/apis/v1/docs/${argv.pageId}/tables/${argv.tableId}/rows`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    authorization: `Bearer ${argv.codaToken}`,
  },
})
  .then((r) => r.json())
  .then((res) => {
    // console.log("res:", res)
    const data = [...res.items]
    const rowsToDelete = data.map((r) => {
      return r.id
    })

    const content = {
      rowIds: rowsToDelete,
    }

    console.log(JSON.stringify(content))

    fetch(`https://coda.io/apis/v1/docs/${argv.pageId}/tables/${argv.tableId}/rows`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${argv.codaToken}`,
      },
      body: JSON.stringify(content),
    }).then((r) => {
      console.log('delete order sent!')

      let flat = []
      rows.forEach(k => {
        flat = [...flat, ...k]
      })
      
      //  Update table
      const content = {
        rows: flat,
      }

      console.log("flat:", JSON.stringify(content, null, 2))

      const url = `https://coda.io/apis/v1/docs/${argv.pageId}/tables/${argv.tableId}/rows?valueFormat=simple&useColumnNames=true`
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${argv.codaToken}`,
        },
        body: JSON.stringify(content),
      }).then((res) => {
        console.log("res:", res)
        
        console.log('upsert done!')
      })
    })
  })
}


const appendToCoda = () => {
  console.log('appending to Coda')

      let flat = []
      rows.forEach(k => {
        flat = [...flat, ...k]
      })
      
      //  Update table
      const content = {
        rows: flat,
      }

      // console.log("flat:", JSON.stringify(content, null, 2))

      const url = `https://coda.io/apis/v1/docs/${argv.pageId}/tables/${argv.tableId}/rows?valueFormat=simple&useColumnNames=true`
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${argv.codaToken}`,
        },
        body: JSON.stringify(content),
      }).then((res) => {
        console.log("res:", res)
        
        console.log('Append done!')
      })
}



 argv.axType == "pending" ? appendToCoda(): updatecoda() 
