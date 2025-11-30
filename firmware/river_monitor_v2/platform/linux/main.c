#include "../../core/app.h"
#include "../../core/system.h"

#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(void) {
    setup();

    while(1) {
        loop();
        return 0;
    }
    return 0;
}

void test_kv_functions() {
        char* key1 = "key1";
    int value1 = 0;
    size_t value1_size = sizeof(value1);

    printf("reading %s\n", key1);
    read_kv(key1, &value1, value1_size);
    printf("read1: [%s] = %d\n", key1, value1);

    value1 = 1;
    // printf("writing %s\n", key1);
    // write_kv(key1, &value1, value1_size);
    printf("reading %s\n", key1);
    read_kv(key1, &value1, value1_size);
    printf("read2: [%s] = %d\n", key1, value1);

    char* key2 = "key2";
    char value2[12];
    // sprintf(value2, "str_value");
    // size_t value2_size = strlen(value2);
    size_t value2_size = 20;
    // printf("writing %s\n", key2);
    // write_kv(key2, &value2, value2_size);
    printf("reading %s\n", key2);
    read_kv(key2, &value2, value2_size);
    printf("read3: [%s] = %s\n", key2, value2);

    char* key3 = "key3";
    // float value3 = 3.14f;
    float value3 = 0;
    size_t value3_size = sizeof(value3);
    // write_kv(key3, &value3, value3_size);
    read_kv(key3, &value3, value3_size);
    printf("read4: [%s] = %0.2f\n", key3, value3);

    // sprintf(value2, "hi");
    // value2_size = strlen(value2);
    // write_kv(key2, &value2, value2_size);

    read_kv(key3, &value3, value3_size);
    printf("read4: [%s] = %0.2f\n", key3, value3);

    value2_size = 20;
    memset(value2, 0, 12);
    read_kv(key2, &value2, value2_size);
    printf("read3: [%s] = %s\n", key2, value2);

    struct Values {
        int v1;
        float v2;
        char v3[50];
    };

    // struct Values values;
    struct Values values = {
        .v1 = 5,
        .v2 = 0.75,
        .v3 = "hello",
    };

    // size_t values_size = sizeof(int) + sizeof(float) + values.v3_size + sizeof(values.v3_size);
    size_t values_size = sizeof(values);

    char* k4 = "stuct_values";
    write_kv(k4, &values, values_size);
    read_kv(k4, &values, values_size);
    printf("[%s] = {%d, %0.2f, %s}\n", k4, values.v1, values.v2, values.v3);
}