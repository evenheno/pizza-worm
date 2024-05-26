#!/bin/bash
script_dir="$(dirname "$(realpath "$0")")"

host="ec2-user@16.171.146.44"
pem="${script_dir}/aqdev.pem"

ssh -i $pem $host
