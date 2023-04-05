echo "Build image asia.gcr.io/${PROJECT_ID}/${PRODUCT_NAME}/${APP_NAME}:${APP_VERSION}"
gcloud beta builds submit . --config k8s/cloud-build.yml \
    --substitutions _PROJECT_ID=$PROJECT_ID,_PRODUCT_NAME=$PRODUCT_NAME,_APP_NAME=$APP_NAME,_APP_VERSION=$APP_VERSION