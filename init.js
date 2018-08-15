load('api_config.js');
load('api_events.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_net.js');
load('api_sys.js');
load('api_timer.js');

let topic = '/devices/' + Cfg.get('device.id') + '/events';

//GPIO
let pin_Open = 23;
let pin_Close = 22;

// MQTT
let mqtt_Topic = 'Fenster';
let timeToStop = 35*1000; // 35sec

let feedBackTime = 10000; //10 Sec
let sleepTime = 1000000; // 1 Sec

GPIO.set_mode(pin_Open, GPIO.MODE_OUTPUT);
GPIO.set_mode(pin_Close, GPIO.MODE_OUTPUT);
GPIO.write(pin_Open, 1);
GPIO.write(pin_Close, 1);


let getInfo = function() {
  return JSON.stringify({
    total_ram: Sys.total_ram(),
    free_ram: Sys.free_ram()
  });
};

Timer.set(feedBackTime /* 1 sec */, Timer.REPEAT, function() {
  print('Still alive!');
}, null);

//ESP32.deepSleep(sleepTime);

// Receive commands from Alexa via MQTT and control window
MQTT.sub(mqtt_Topic, function(conn, mqtt_Topic, msg) {
  print('Topic: ', mqtt_Topic, 'message:', msg);
  
  // Actions
  if(msg === 'open'){
    GPIO.write(pin_Close, 1);
    GPIO.write(pin_Open, 0);
    Timer.set(timeToStop, 0, function() {
      GPIO.write(pin_Open, 1);
      GPIO.write(pin_Close, 1);
      print('Topic: ', mqtt_Topic, 'message:', 'Pins shutdown');
    }, null);
  }else if(msg === 'close'){
    GPIO.write(pin_Open, 1);
    GPIO.write(pin_Close, 0);
    Timer.set(timeToStop, 0, function() {
      GPIO.write(pin_Open, 1);
      GPIO.write(pin_Close, 1);
      print('Topic: ', mqtt_Topic, 'message:', 'Pins shutdown');
    }, null);
  }
}, null);

// Monitor network connectivity.
Event.addGroupHandler(Net.EVENT_GRP, function(ev, evdata, arg) {
  let evs = '???';
  if (ev === Net.STATUS_DISCONNECTED) {
    evs = 'DISCONNECTED';
  } else if (ev === Net.STATUS_CONNECTING) {
    evs = 'CONNECTING';
  } else if (ev === Net.STATUS_CONNECTED) {
    evs = 'CONNECTED';
  } else if (ev === Net.STATUS_GOT_IP) {
    evs = 'GOT_IP';
  }
  print('== Net event:', ev, evs);
}, null);