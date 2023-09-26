#!/bin/bash

#region_id='cn-hangzhou'
#alias_name='prod'
#function_name='web-framework-6ucm'
#canary_percent='54.1'
#access=quanxi

echo "find for publish canary version for ${function_name} 's latest version"
publish_output=$(s cli fc3 version publish --access "${access}" --region "${region_id}" --function-name="${function_name}" -o yaml)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
  if [[ ${publish_output} =~ "No changes were made since last publish" ]]; then
    echo "No change, skip publish"
  else
    echo "failed to publish version, output: ${publish_output}"
    exit 1
  fi
else
  echo "${publish_output}"
fi


list_output=$(s cli fc3 version list --access "${access}" --region "${region_id}" --function-name="${function_name}" -o yaml)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
  echo "failed to list version, output: ${list_output}"
  exit 1
fi

canary_version_id=$(echo "${list_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'versionId' | head -1 | awk '{print $2}')
get_alias_output=$(s cli fc3 alias get --access "${access}" --region "${region_id}" --function-name="${function_name}" --alias-name="${alias_name}" -o yaml)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
	echo "alias not exist, output: ${get_alias_output}"
	echo "publish alias ${alias_name} for version ${canary_version_id}"
	# create alias with canary tag
	publish_alias_output=$(s cli fc3 alias publish --access "${access}" --region "${region_id}" --function-name="${function_name}" --alias-name="${alias_name}" --version-id="${canary_version_id}" -o yaml)
	return_code=$?
	if [[ ${return_code} -ne 0 ]]; then
		echo "failed to publish version, output: ${publish_alias_output}"
		exit 1
	fi
	exit 0
fi
current_version_id=$(echo "${get_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'versionId' | awk '{print $2}')
canary_version_ratio=$(echo "scale=3; ${canary_percent} / 100" | bc | awk '{printf "%.3f\n", $0}')
publish_alias_output=$(s cli fc3 alias publish --region ${region_id} --access "${access}" --function-name="${function_name}" --alias-name "${alias_name}" --additionalVersionWeight "{\"${canary_version_id}\":${canary_version_ratio}}" --version-id "${current_version_id}" -o yaml 2>&1)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
    no_change_err=$(echo "${publish_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'Can not update alias without any change')
    if [[ $no_change_err == "" ]]; then
        echo "failed to update canary configuration, output: ${publish_alias_output}"
        exit 1
    fi
fi
echo "function[${function_name}]/alias[${alias_name}] updated. MainVersion: ${current_version_id}, CanaryVersion: ${canary_version_id}, Percent: ${canary_percent}%"
s cli fc3 alias get --region ${region_id} --access "${access}" --function-name="${function_name}" --alias-name "${alias_name}" -o yaml
