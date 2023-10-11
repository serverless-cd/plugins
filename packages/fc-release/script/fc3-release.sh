#!/bin/bash

#region_id='cn-hangzhou'
#alias_name='prod'
#function_name='web-framework-6ucm'
#access=quanxi


get_alias_output=$(s cli fc3 alias get --access "${access}" --region "${region_id}" --function-name="${function_name}" --alias-name="${alias_name}" -o yaml)
return_code=$?

if [[ ${return_code} -ne 0 ]]; then
	echo "alias not exist, output: ${get_alias_output}"
	echo "publish alias ${alias_name} for version latest"
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
	list_output=$(s cli fc3 version list --access "${access}" --region "${region_id}" --function-name="${function_name}" -o yaml)
  return_code=$?
  if [[ ${return_code} -ne 0 ]]; then
    echo "failed to list version, output: ${list_output}"
    exit 1
  fi

  latest_version_id=$(echo "${list_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'versionId' | head -1 | awk '{print $2}')

	publish_alias_output=$(s cli fc3 alias publish --access "${access}" --region "${region_id}" --function-name="${function_name}" --alias-name="${alias_name}" --version-id "${latest_version_id}" -o yaml)
	return_code=$?
	if [[ ${return_code} -ne 0 ]]; then
		echo "failed to publish latest version for ${alias_name}, output: ${publish_alias_output}"
		exit 1
	fi
	echo "${publish_alias_output}"
	exit 0
fi

canary_version_id=$(echo "${get_alias_output}" | awk '/additionalVersionWeight:/{getline; print}' | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | awk '{gsub(":", "", $1); print $1}')

if [[ ${canary_version_id} =~ ^[0-9]+$ ]]; then
    echo "alias ${alias_name} has canary version ${canary_version_id}"
else
    canary_version_id=$(s cli fc3 version list --access "${access}" --region "${region_id}" --function-name="${function_name}" -o yaml | grep --color=never versionId | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | head -1 | awk '{print $2}')
    echo "alias ${alias_name} has no canary versionID. use latest version ${canary_version_id} instead"
fi

publish_alias_output=$(s cli fc3 alias publish --region ${region_id} --access "${access}" --function-name="${function_name}" --alias-name "${alias_name}" --version-id "${canary_version_id}" --additionalVersionWeight "{}" -o yaml 2>&1)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
    no_change_err=$(echo "${publish_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'Can not update alias without any change')
    if [[ $no_change_err == "" ]]; then
        echo "failed to update canary configuration, output: ${publish_alias_output}"
        exit 1
    fi
fi
echo "function[${function_name}]/alias[${alias_name}] updated. MainVersion: ${canary_version_id}"
s cli fc3 alias get --access "${access}" --region "${region_id}" --function-name="${function_name}" --alias-name="${alias_name}" -o yaml
