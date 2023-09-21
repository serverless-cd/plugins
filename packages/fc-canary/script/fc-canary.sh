#!/bin/bash

# region_id='cn-hangzhou'
# alias_name='prod'
# service_name='web-framework-6ucm'
# canary_percent='54.1'
# access=default

publish_output=$(s cli fc version publish --access "${access}" --region "${region_id}" --service-name="${service_name}" --ignore-no-chang-error)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
	echo "failed to publish version, output: ${publish_output}"
	exit 1
fi
echo "${publish_output}"
canary_version_id=$(echo "${publish_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'versionId' | awk '{print $2}')
get_alias_output=$(s cli fc alias get --access "${access}" --region "${region_id}" --service-name="${service_name}" --alias-name="${alias_name}")
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
	echo "alias not exist, output: ${get_alias_output}"
	echo "publish alias ${alias_name} for version ${canary_version_id}"
	publish_alias_output=$(s cli fc alias publish --access "${access}" --region "${region_id}" --service-name="${service_name}" --alias-name="${alias_name}" --version-id=${canary_version_id})
	return_code=$?
	if [[ ${return_code} -ne 0 ]]; then
		echo "failed to publish version, output: ${publish_alias_output}"
		exit 1
	fi
	exit 0
fi
current_version_id=$(echo "${get_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'versionId' | awk '{print $2}')

publish_alias_output=$(s cli fc alias publish --region ${region_id} --access "${access}" --service-name="${service_name}" --alias-name "${alias_name}" --gversion "${canary_version_id}" --version-id "${current_version_id}" --weight "${canary_percent}"  --resolvePolicy 'Random' 2>&1)
return_code=$?
if [[ ${return_code} -ne 0 ]]; then
    no_change_err=$(echo "${publish_alias_output}" | sed 's/\x1B\[[0-9;]*[JKmsu]//g' | grep --color=never 'Can not update alias without any change')
    if [[ $no_change_err == "" ]]; then
        echo "failed to update canary configuration, output: ${publish_alias_output}"
        exit 1
    fi
fi
echo "service[${service_name}]/alias[${alias_name}] updated. MainVersion: ${current_version_id}, CanaryVersion: ${canary_version_id}, Percent: ${canary_percent}%"
s cli fc alias get --region ${region_id} --access "${access}" --service-name="${service_name}" --alias-name "${alias_name}"
exit 0