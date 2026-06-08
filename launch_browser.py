import urllib.request, time, os 
while True: 
    try: 
        if urllib.request.urlopen('http://localhost:8000').getcode() == 200: 
            os.system('start http://localhost:5173') 
            break 
    except: 
        pass 
    time.sleep(1) 
