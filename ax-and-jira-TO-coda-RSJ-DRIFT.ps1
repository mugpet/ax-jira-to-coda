# get jira issues
node .\jira-sync.js --table-type "issue" --jira-token "NjI3NDk1NzMwNDcxOlHf3oyuXlRCuiwxzd0lPdUAS4ja" --coda-token "83050ed5-ef90-4205-92d3-d53ede6cdd6e"  --boardId "363" --page-id "HBY9G8wcWz" --table-id "grid-ibcTFqNbrD" --json-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_RSJ_DRIFT"
timeout 3


# get Ax data
node load-ax --ax-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_RSJ_DRIFT.xlsx"  --coda-token "83050ed5-ef90-4205-92d3-d53ede6cdd6e" --page-id "HBY9G8wcWz" --table-id "grid-gfu8hrgtPG" 


