#!/bin/bash

# region_id='cn-hangzhou'
# alias_name='prod'
# service_name='web-framework-6ucm'
# access=default

get_alias_output=$(s cli fc alias get --access "${access}" --region "${region_id}" --service-name="${service_name}" --alias-name="${alias_name}")
return_code=$?

if [[ ${return_code} -ne 0 ]]; then
	echo "alias not exist, output: ${get_alias_output}"
	echo "publish alias ${alias_name} for version latest"
	publish_alias_output=$(s cli fc alias publish --access "${access}" --region "${region_id}" --service-name="${service_name}" --alias-name="${alias_name}" --version-latest)
	return_code=$?
	if [[ ${return_code} -ne 0 ]]; then
		echo "failed to publish latest version for ${alias_name}, output: ${publish_alias_output}"
		exit 1
	fi
	echo "${publish_alias_output}"
	exit 0
fi

canary_version_id=$(echo "${get_alias_output}" | awk '/additionalVersionWeight:/{getline; print}' | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | awk '{gsub(":", "", $1); print $1}' )

if [[ ${canary_version_id} =~ ^[0-9]+$ ]]; then
    echo "alias ${alias_name} has canary version ${canary_version_id}"
else
    canary_version_id=$(s cli fc version list --access "${access}" --region "${region_id}" --service-name="${service_name}" | grep --color=never versionId | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | head -1 | awk '{print $2}')
    echo "alias ${alias_name} has no canary versionID. use latest version ${canary_version_id} instead"
fi

publish_alias_output=$(s cli fc alias publish --region ${region_id} --access "${access}" --service-name="${service_name}" --alias-name "${alias_name}" --version-id "${canary_version_id}" 2>&1)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
    no_change_err=$(echo "${publish_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'Can not update alias without any change')
    if [[ $no_change_err == "" ]]; then
        echo "failed to update canary configuration, output: ${publish_alias_output}"
        exit 1
    fi
fi
echo "service[${service_name}]/alias[${alias_name}] updated. MainVersion: ${canary_version_id}"
s cli fc alias get --access "${access}" --region "${region_id}" --service-name="${service_name}" --alias-name="${alias_name}"

