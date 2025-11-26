#ifndef INTERNET_INTERFACE_H
#define INTERNET_INTERFACE_H

#include "config.h"

int connect_to_server(Config* conf);
int send_payload(char* payload);

#endif
