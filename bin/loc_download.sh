#!/usr/bin/env bash
#
# Download and unzip the ISO 639-2 file from the Library of Congress.
#

set -o nounset
set -o errexit
set -o pipefail

SCRIPT_HOME="$( cd "$( dirname "$0" )" && pwd )"
BASE_DIR=$(realpath "${SCRIPT_HOME}/..")

echo "INFO: starting ucd download at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

TMP_DIR="${BASE_DIR}/tmp"
if [ ! -d "${TMP_DIR}" ]; then
	echo "INFO: creating temp dir ${TMP_DIR}"
	mkdir -p "${TMP_DIR}"
else
	echo "INFO: using existing temp dir ${TMP_DIR}"
fi

curl \
	--location \
	--output "${TMP_DIR}/iso-639-2.txt" \
	--show-error \
	--silent \
	https://www.loc.gov/standards/iso639-2/ISO-639-2_utf-8.txt

echo "INFO: completed ucd download at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
