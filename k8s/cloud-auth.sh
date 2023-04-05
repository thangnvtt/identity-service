echo ${GCLOUD_SERVICE_ACCOUNT_KEY} > /tmp/gcloud-service-account-key.json
gcloud auth activate-service-account --key-file /tmp/gcloud-service-account-key.json
gcloud config set project ${PROJECT_ID}

if [ "$CLUSTER_NAME" != "" ]; then
    gcloud container clusters get-credentials ${CLUSTER_NAME} --zone ${GCP_ZONE} --project ${PROJECT_ID}
fi