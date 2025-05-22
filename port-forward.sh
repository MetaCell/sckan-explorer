# killall -9 kubectl 

kubectl port-forward -n sckanner deployment/sckanner-db 5432:5432 &
