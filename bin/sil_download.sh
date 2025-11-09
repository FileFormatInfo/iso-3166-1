#!/usr/bin/env bash
#
# Download and unzip the ISO 639-3 file from SIL.
#

set -o nounset
set -o errexit
set -o pipefail

SCRIPT_HOME="$( cd "$( dirname "$0" )" && pwd )"
BASE_DIR=$(realpath "${SCRIPT_HOME}/..")

echo "INFO: starting sil download at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

TMP_DIR="${BASE_DIR}/tmp"
if [ ! -d "${TMP_DIR}" ]; then
	echo "INFO: creating temp dir ${TMP_DIR}"
	mkdir -p "${TMP_DIR}"
else
	echo "INFO: using existing temp dir ${TMP_DIR}"
fi

curl \
	--location \
	--output "${TMP_DIR}/iso-639-3.zip" \
	--show-error \
	--silent \
	https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3_Code_Tables_20251015.zip

cd "${TMP_DIR}"
unzip -j "${TMP_DIR}/iso-639-3.zip"

echo "INFO: completed sil download at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
