# killall -9 kubectl 

kubectl port-forward -n sckanner deployment/sckanner-db 5432:5432 &
kubectl port-forward --namespace sckanner $(kubectl get po -n sckanner | grep kafka | \awk '{print $1;}') 9092:9092 &
