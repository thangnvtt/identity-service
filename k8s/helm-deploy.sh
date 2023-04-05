echo "Deploy helm ${HELM_NAME}. Env: ${ENVIRONMENT}. Repo ${IMAGE_REPOSITORY}:${IMAGE_TAG} timestamp ${CURRENT_TIMESTAMP}"

helm upgrade \
    --set app.deploymentTimestamp=${CURRENT_TIMESTAMP} \
    --set image.repository=${IMAGE_REPOSITORY} \
    --set image.tag=${IMAGE_TAG} \
    --debug \
    -i \
    -n ${NAMESPACE} \
    -f ./k8s/helm/values.${ENVIRONMENT}.yaml ${HELM_NAME} \
    ./k8s/helm
