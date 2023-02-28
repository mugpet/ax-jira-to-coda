# get jira issues
node .\jira-sync.js --table-type "issue" --jira-token "NjI3NDk1NzMwNDcxOlHf3oyuXlRCuiwxzd0lPdUAS4ja" --coda-token "7af26147-84ff-42bc-bfce-8da501e62be3"  --boardId "387" --page-id "blMzFdHFjT" --table-id "grid-AM6YilVpub" --json-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_SASCargoNewBI_epics" 
timeout 3


# get Ax data
node load-ax --ax-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_SASCargoNewBI.xlsx"  --coda-token "7af26147-84ff-42bc-bfce-8da501e62be3" --page-id "blMzFdHFjT" --table-id "grid-mICL-7xwgp" 

# pending
#timeout 3
# node load-ax --ax-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_SASCargoNewBI_pending.xlsx"  --coda-token "7af26147-84ff-42bc-bfce-8da501e62be3" --page-id "blMzFdHFjT" --table-id "grid-mICL-7xwgp" --ax-type pending
