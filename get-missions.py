import json
import urllib.request

response = urllib.request.urlopen("https://www.meldkamerspel.com/einsaetze.json")
einsaetze = json.loads(response.read())

missions = {}
for mission in einsaetze:
    missions[mission.get('id')] = mission.get('name')

json.dump(missions, open('missions.json', 'w'), indent=4)