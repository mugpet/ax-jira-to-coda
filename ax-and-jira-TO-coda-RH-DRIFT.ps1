# get jira epics
# New token mpe = "MDE4Nzc3MTE1MTcxOg8IlPz9mOokWW2DakdRfNZAiQLI"
# node .\jira-sync.js --table-type "epic" --jira-token "MDE4Nzc3MTE1MTcxOg8IlPz9mOokWW2DakdRfNZAiQLI" --coda-token "83050ed5-ef90-4205-92d3-d53ede6cdd6e"  --boardId "362" --page-id "HBY9G8wcWz" --table-id "grid-uMQw7ZZeK_" --json-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_RH_DRIFT_epics.json" 
# timeout 3


# get jira issues
node .\jira-sync.js --table-type "issue" --jira-token "NjI3NDk1NzMwNDcxOlHf3oyuXlRCuiwxzd0lPdUAS4ja" --coda-token "83050ed5-ef90-4205-92d3-d53ede6cdd6e"  --boardId "362" --page-id "HBY9G8wcWz" --table-id "grid-NoRFOtX6yZ"  --json-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_RH_DRIFT_epics.json" 

# get Ax data
timeout 3
node load-ax --ax-file "C:\\code\\nodejs\\danbolig-project\\Project transactions_RH_DRIFT.xlsx"  --coda-token "83050ed5-ef90-4205-92d3-d53ede6cdd6e" --page-id "HBY9G8wcWz" --table-id "grid-pl6F0fpeZD" 
