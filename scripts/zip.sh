mkdir -p ./output
zip -r "./output/source-$(date +%d-%b-%Y_%H-%M | tr '[:upper:]' '[:lower:]').zip" src/* package.json
