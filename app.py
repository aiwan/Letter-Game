#!/usr/bin/env python
# -*- coding: utf-8 -*-

### Andres Iwan ###

from bottle import route, run, template, static_file, get, post, request
import json
import urllib2
import random
import pickle
from os import listdir, path
from sys import argv

word_site = "http://svnweb.freebsd.org/csrg/share/dict/words?view=co&content-type=text/plain"

response = urllib2.urlopen(word_site)
txt = response.read()
WORDS_AS_LIST = txt.splitlines()

#################################################################
####################### FUNCTIONS ###############################
#################################################################

def append_in_file(file_name, information):
    f = open(file_name, 'w')
    pickle.dump(information, f)
    f.close()

def read_from_file(file_name):
    f = open(file_name, 'r')
    try:
        information =  pickle.load(f)
    except EOFError:
        information = ''
    f.close()
    return information

#################################################################
######################## DECORATORS #############################
#################################################################

@get('/')
def index():
    return template("index.html")

@get("/data")
def get_data():
    random_word = random.choice(WORDS_AS_LIST)
    return json.dumps(random_word)

@post("/highscores")
def update_highscores():
    full_path = path.realpath(__file__)
    dir_path = path.dirname(full_path)
    last_score = request.forms.get('score')
    if path.isfile(path.join(dir_path, 'highscores.txt')):
         f = open('highscores.txt', 'r')
         highscores = pickle.load(f)
         highscores = [int(x) for x in highscores]
         highscores.append(int(last_score))
         highscores.sort()
         highscores.reverse()
         highscores.pop()
         f.close()
         f = open('highscores.txt', 'w')
    else:
         f = open('highscores.txt', 'w')
         highscores = [int(last_score), 0, 0, 0, 0]

    pickle.dump(highscores, f)
    f.close()

    return json.dumps(highscores)

#################################################################
########################## FILES ################################
#################################################################

@get('/js/<filename:re:.*\.js>')
def javascripts(filename):
    return static_file(filename, root='js')

@get('/css/<filename:re:.*\.css>')
def stylesheets(filename):
    return static_file(filename, root='css')

@get('/images/<filename:re:.*\.(jpg|png|gif|ico)>')
def images(filename):
    return static_file(filename, root='images')

run(host='localhost', port=7000)

# run(host='0.0.0.0', port=argv[1])




