<template>
  <div>
    <v-menu
      v-model="openDialog"
      :close-on-content-click="false"
      :nudge-width="200"
      offset-y
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" v-bind="attrs" v-on="on">
          Заполнить по ИНН (ОГРН)
        </v-btn>
      </template>

      <v-card>
        <v-card-title>Введите ИНН или ОГРН (ОГРНИП)</v-card-title>
        <v-card-text>
          <v-toolbar dense flat tile>
            <text-input
              v-model="inn"
              type="integer"
              :hint="resultHint"
              @clear="clearInn"
            ></text-input>
            <v-spacer></v-spacer>
            <v-btn
              :text="!innValid"
              color="primary"
              :disabled="!innValid"
              @click="runSearch"
              >Найти</v-btn
            >
          </v-toolbar>
        </v-card-text>
        <v-card-text>
          <v-data-table
            v-if="dataExists"
            v-model="tableSelected"
            :headers="tableHeaders"
            :items="data"
            :single-select="true"
            show-select
            item-key="data.hid"
            hide-default-footer
            hide-default-header
          ></v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn :disabled="!isSelected" color="primary" @click="commit">
            ОК
          </v-btn>
          <v-btn class="secondary" :text="true" @click="closeDialog">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import axios from "axios";

import TextInputVue from "../Form/TextInput.vue";
import { mapGetters } from "vuex";
export default {
  name: "search-in-egrul",
  components: {
    "text-input": TextInputVue,
  },
  props: {
    //  тип поиска "type": "INDIVIDUAL"/"LEGAL"
    isUL: {
      type: Boolean,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      // открыт диалог поиска по егрюл
      openDialog: false,
      //   полученные значения из егрюл
      data: [],
      //   data: [
      //     {
      //       value: 'ООО "БИОБАК"',
      //       unrestricted_value: 'ООО "БИОБАК"',
      //       data: {
      //         kpp: "771801001",
      //         capital: null,
      //         management: {
      //           name: "Казарян Ваагн Гайкович",
      //           post: "ГЕНЕРАЛЬНЫЙ ДИРЕКТОР",
      //           disqualified: null,
      //         },
      //         founders: null,
      //         managers: null,
      //         predecessors: null,
      //         successors: null,
      //         branch_type: "MAIN",
      //         branch_count: 1,
      //         source: null,
      //         qc: null,
      //         hid:
      //           "40f232887274f5f14a8b8a5e16fab9c150c5f6bc60f87d39e992dd0ea0f4e7ba",
      //         type: "LEGAL",
      //         state: {
      //           status: "ACTIVE",
      //           code: null,
      //           actuality_date: 1627948800000,
      //           registration_date: 1358726400000,
      //           liquidation_date: null,
      //         },
      //         opf: {
      //           type: "2014",
      //           code: "12300",
      //           full: "Общество с ограниченной ответственностью",
      //           short: "ООО",
      //         },
      //         name: {
      //           full_with_opf:
      //             'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "БИОБАК"',
      //           short_with_opf: 'ООО "БИОБАК"',
      //           latin: null,
      //           full: "БИОБАК",
      //           short: "БИОБАК",
      //         },
      //         inn: "7718917660",
      //         ogrn: "1137746030421",
      //         okpo: "17011189",
      //         okato: "45263594000",
      //         oktmo: "45316000000",
      //         okogu: "4210011",
      //         okfs: "34",
      //         okved: "20.14",
      //         okveds: null,
      //         authorities: null,
      //         documents: null,
      //         licenses: null,
      //         finance: {
      //           tax_system: null,
      //           income: null,
      //           expense: null,
      //           debt: null,
      //           penalty: null,
      //           year: null,
      //         },
      //         address: {
      //           value: "г Москва, ул Черкизовская Б., д 3 к 2, кв 141",
      //           unrestricted_value:
      //             "107061, г Москва, Преображенское р-н, ул Черкизовская Б., д 3 к 2, кв 141",
      //           data: {
      //             postal_code: "107061",
      //             country: "Россия",
      //             country_iso_code: "RU",
      //             federal_district: "Центральный",
      //             region_fias_id: "0c5b2444-70a0-4932-980c-b4dc0d3f02b5",
      //             region_kladr_id: "7700000000000",
      //             region_iso_code: "RU-MOW",
      //             region_with_type: "г Москва",
      //             region_type: "г",
      //             region_type_full: "город",
      //             region: "Москва",
      //             area_fias_id: null,
      //             area_kladr_id: null,
      //             area_with_type: null,
      //             area_type: null,
      //             area_type_full: null,
      //             area: null,
      //             city_fias_id: "0c5b2444-70a0-4932-980c-b4dc0d3f02b5",
      //             city_kladr_id: "7700000000000",
      //             city_with_type: "г Москва",
      //             city_type: "г",
      //             city_type_full: "город",
      //             city: "Москва",
      //             city_area: "Восточный",
      //             city_district_fias_id: null,
      //             city_district_kladr_id: null,
      //             city_district_with_type: "Преображенское р-н",
      //             city_district_type: "р-н",
      //             city_district_type_full: "район",
      //             city_district: "Преображенское",
      //             settlement_fias_id: null,
      //             settlement_kladr_id: null,
      //             settlement_with_type: null,
      //             settlement_type: null,
      //             settlement_type_full: null,
      //             settlement: null,
      //             street_fias_id: "cedd65d1-668f-45b2-86de-ec26bbded4e2",
      //             street_kladr_id: "77000000000308800",
      //             street_with_type: "ул Черкизовская Б.",
      //             street_type: "ул",
      //             street_type_full: "улица",
      //             street: "Черкизовская Б.",
      //             house_fias_id: "f83c03cc-19b5-4a6e-9fff-6768a16abc0a",
      //             house_kladr_id: "7700000000030880010",
      //             house_cadnum: null,
      //             house_type: "д",
      //             house_type_full: "дом",
      //             house: "3",
      //             block_type: "к",
      //             block_type_full: "корпус",
      //             block: "2",
      //             entrance: null,
      //             floor: null,
      //             flat_fias_id: null,
      //             flat_cadnum: null,
      //             flat_type: "кв",
      //             flat_type_full: "квартира",
      //             flat: "141",
      //             flat_area: "60.1",
      //             square_meter_price: "249530",
      //             flat_price: "14996753",
      //             postal_box: null,
      //             fias_id: "f83c03cc-19b5-4a6e-9fff-6768a16abc0a",
      //             fias_code: "77000000000000030880010",
      //             fias_level: "8",
      //             fias_actuality_state: "0",
      //             kladr_id: "7700000000030880010",
      //             geoname_id: "524901",
      //             capital_marker: "0",
      //             okato: "45263594000",
      //             oktmo: "45316000",
      //             tax_office: "7718",
      //             tax_office_legal: "7718",
      //             timezone: "UTC+3",
      //             geo_lat: "55.7979447",
      //             geo_lon: "37.7167517",
      //             beltway_hit: "IN_MKAD",
      //             beltway_distance: null,
      //             metro: [
      //               {
      //                 name: "Преображенская площадь",
      //                 line: "Сокольническая",
      //                 distance: 0.3,
      //               },
      //               {
      //                 name: "Семёновская",
      //                 line: "Арбатско-Покровская",
      //                 distance: 1.7,
      //               },
      //               {
      //                 name: "Черкизовская",
      //                 line: "Сокольническая",
      //                 distance: 1.8,
      //               },
      //             ],
      //             qc_geo: "0",
      //             qc_complete: null,
      //             qc_house: null,
      //             history_values: null,
      //             unparsed_parts: null,
      //             source:
      //               "107061, ГОРОД МОСКВА, УЛ. ЧЕРКИЗОВСКАЯ Б., Д.3, К.2, КВ.141",
      //             qc: "0",
      //           },
      //         },
      //         phones: null,
      //         emails: null,
      //         ogrn_date: 1358726400000,
      //         okved_type: "2014",
      //         employee_count: null,
      //       },
      //     },
      //     {
      //       value: '"БИОБАК ТРЕЙД"',
      //       unrestricted_value: '"БИОБАК ТРЕЙД"',
      //       data: {
      //         kpp: "501743001",
      //         capital: null,
      //         management: null,
      //         founders: null,
      //         managers: null,
      //         predecessors: null,
      //         successors: null,
      //         branch_type: "BRANCH",
      //         branch_count: 0,
      //         source: null,
      //         qc: null,
      //         hid:
      //           "8bb0968bc0de95edaf334aff7ad2a5c714395b86e337bfb0044f1ca4f3a8a2e6",
      //         type: "LEGAL",
      //         state: {
      //           status: "ACTIVE",
      //           code: null,
      //           actuality_date: 1627948800000,
      //           registration_date: null,
      //           liquidation_date: null,
      //         },
      //         opf: {
      //           type: "2014",
      //           code: "30002",
      //           full: "Филиал юридического лица",
      //           short: "Филиал",
      //         },
      //         name: {
      //           full_with_opf: '"БИОБАК ТРЕЙД"',
      //           short_with_opf: '"БИОБАК ТРЕЙД"',
      //           latin: null,
      //           full: "БИОБАК ТРЕЙД",
      //           short: '"БИОБАК ТРЕЙД"',
      //         },
      //         inn: "7718917660",
      //         ogrn: "1137746030421",
      //         okpo: null,
      //         okato: null,
      //         oktmo: null,
      //         okogu: null,
      //         okfs: null,
      //         okved: null,
      //         okveds: null,
      //         authorities: null,
      //         documents: null,
      //         licenses: null,
      //         finance: {
      //           tax_system: null,
      //           income: null,
      //           expense: null,
      //           debt: null,
      //           penalty: null,
      //           year: null,
      //         },
      //         address: {
      //           value:
      //             "Московская обл, г Истра, г Дедовск, ул 1-я Волоколамская, д 60",
      //           unrestricted_value:
      //             "143532, Московская обл, г Истра, г Дедовск, ул 1-я Волоколамская, д 60",
      //           data: {
      //             postal_code: "143532",
      //             country: "Россия",
      //             country_iso_code: "RU",
      //             federal_district: "Центральный",
      //             region_fias_id: "29251dcf-00a1-4e34-98d4-5c47484a36d4",
      //             region_kladr_id: "5000000000000",
      //             region_iso_code: "RU-MOS",
      //             region_with_type: "Московская обл",
      //             region_type: "обл",
      //             region_type_full: "область",
      //             region: "Московская",
      //             area_fias_id: "f05b2b62-f54c-4b44-aff2-6bc3e55a640c",
      //             area_kladr_id: "5004600000000",
      //             area_with_type: "г Истра",
      //             area_type: "г",
      //             area_type_full: "город",
      //             area: "Истра",
      //             city_fias_id: "05b3833e-37b3-470e-bf21-78adf1eec36f",
      //             city_kladr_id: "5004600200000",
      //             city_with_type: "г Дедовск",
      //             city_type: "г",
      //             city_type_full: "город",
      //             city: "Дедовск",
      //             city_area: null,
      //             city_district_fias_id: null,
      //             city_district_kladr_id: null,
      //             city_district_with_type: null,
      //             city_district_type: null,
      //             city_district_type_full: null,
      //             city_district: null,
      //             settlement_fias_id: null,
      //             settlement_kladr_id: null,
      //             settlement_with_type: null,
      //             settlement_type: null,
      //             settlement_type_full: null,
      //             settlement: null,
      //             street_fias_id: "5590bced-2185-443f-a53e-775f5dab3941",
      //             street_kladr_id: "50046002000034600",
      //             street_with_type: "ул 1-я Волоколамская",
      //             street_type: "ул",
      //             street_type_full: "улица",
      //             street: "1-я Волоколамская",
      //             house_fias_id: "49881922-3691-48f1-ba12-c42a04fa5bc9",
      //             house_kladr_id: "5004600200003460042",
      //             house_cadnum: null,
      //             house_type: "д",
      //             house_type_full: "дом",
      //             house: "60",
      //             block_type: null,
      //             block_type_full: null,
      //             block: null,
      //             entrance: null,
      //             floor: null,
      //             flat_fias_id: null,
      //             flat_cadnum: null,
      //             flat_type: null,
      //             flat_type_full: null,
      //             flat: null,
      //             flat_area: null,
      //             square_meter_price: "83333",
      //             flat_price: null,
      //             postal_box: null,
      //             fias_id: "49881922-3691-48f1-ba12-c42a04fa5bc9",
      //             fias_code: "50046002000000003460042",
      //             fias_level: "8",
      //             fias_actuality_state: "0",
      //             kladr_id: "5004600200003460042",
      //             geoname_id: "566854",
      //             capital_marker: "0",
      //             okato: "46433506000",
      //             oktmo: "46733000006",
      //             tax_office: "5017",
      //             tax_office_legal: "5017",
      //             timezone: "UTC+3",
      //             geo_lat: "55.8750465",
      //             geo_lon: "37.1241329",
      //             beltway_hit: "OUT_MKAD",
      //             beltway_distance: "18",
      //             metro: null,
      //             qc_geo: "1",
      //             qc_complete: null,
      //             qc_house: null,
      //             history_values: null,
      //             unparsed_parts: null,
      //             source:
      //               "143530, ОБЛАСТЬ МОСКОВСКАЯ, РАЙОН ИСТРИНСКИЙ, ГОРОД ДЕДОВСК, УЛИЦА ВОЛОКОЛАМСКАЯ 1-Я, 60",
      //             qc: "0",
      //           },
      //         },
      //         phones: null,
      //         emails: null,
      //         ogrn_date: null,
      //         okved_type: null,
      //         employee_count: null,
      //       },
      //     },
      //   ],
      //   поисковая фраза
      inn: null,
      // выбранное значение из таблицы
      tableSelected: [],
      //   подсказка по результату
      resultHint: null,
    };
  },
  computed: {
    ...mapGetters(["daDataToken"]),
    //   ИНН заполнен валидными значениями
    innValid() {
      let regexp = /^\d{10,15}$/;
      return regexp.test(this.inn);
    },
    // столбцы таблицы
    tableHeaders() {
      return [
        {
          text: "Наименование",
          align: "start",
          sortable: true,
          value: "value",
        },
      ];
    },
    // выбрана строка таблицы
    isSelected() {
      return this.tableSelected.length == 1;
    },
    // данные получены
    dataExists() {
      try {
        return this.data.length > 0;
      } catch (error) {
        // do nothing
      }
      return false;
    },
    // единственный результат
    isSingleOrg() {
      return this.dataExists && this.data.length == 1;
    },
  },
  methods: {
    //   поиск по ЕГРЮЛ
    runSearch() {
      //   console.log(`search inn ${this.inn}`);
      const url =
        "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party";
      const token = this.daDataToken;
      // тело запроса
      let requestBody = { query: this.inn };
      // среди кого искать
      if (this.isUL !== null) {
        if (this.isUL === true) {
          requestBody.type = "LEGAL";
        } else {
          requestBody.type = "INDIVIDUAL";
        }
      }
      // параметры запроса
      let axiosOptions = {
        method: "POST",
        url,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Token " + token,
        },
        data: JSON.stringify(requestBody),
      };

      axios(axiosOptions)
        .then((response) => {
          this.data = response.data.suggestions;
          if (this.dataExists) {
            // console.log(`data=${JSON.stringify(this.data)}`);
          } else {
            this.resultHint = "Ничего не найдено";
          }
        })
        .catch((error) => {
          console.log("error", error);
          this.resultHint = "Ошибка обращения к серверу ЕГРЮЛ";
        });
    },
    // закрываем форму
    closeDialog() {
      this.openDialog = false;
    },
    // передаем данные
    commit() {
      this.inn = null;
      this.$emit("input", this.tableSelected[0]);
      this.data = null;
      this.resultHint = null;
      this.closeDialog();
    },
    // очистка поиска ИНН
    clearInn() {
      this.resultHint = null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
