#!/bin/bash
script_dir="$(dirname "$(realpath "$0")")"

port="8080"
host="ec2-user@16.171.146.44"
pem="${script_dir}/aqdev.pem"
local_dir="./dist"
remote_dir="~/wwwroot/pworm"
chmod 400 $pem

echo "Ensuring target path: ${remote_dir}"
ssh -i $pem $host "mkdir -p ${remote_dir}"

echo "Deploying distribution.."
rsync -e "ssh -i ${pem}" -r -v --delete "${local_dir}/" "${host}:${remote_dir}/"

echo "Running server.."
ssh -i $pem $host "cd ${remote_dir} && lsof -i :${port} || nohup http-server -p ${port} -c-1 > http-server.log 2>&1 &"

echo "Done."