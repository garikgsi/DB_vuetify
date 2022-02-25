<template>
  <div>
    <!-- formValues={{ formValues }} -->
    <abp-simple-form
      :title="title"
      v-model="formValues"
      :closable="isClosable"
      :model="formFields"
      :disabled-submit-button="!fullValid"
      @validated="formValidated($event)"
      @input="changeVal($event)"
      @submit="submit"
    >
      <template v-slot:after-fields>
        <v-divider></v-divider>
        <abp-document-table
          table="order_items"
          title="Позиции заказа"
          :sklad-id="formValues.sklad_id ? formValues.sklad_id : null"
          :no-nds="false"
          color="primary"
          v-model="formValues.items"
          :disabled="!formValid"
          :total="itemsTotal"
          @validated="tableValidated($event)"
          @input="changeVal($event)"
        ></abp-document-table>
      </template>
      <!-- кнопка закрыть -->
      <template v-slot:buttons-right>
        <slot name="after">
          <v-row>
            <v-col class="d-flex align-end flex-column">
              <v-btn text class="ma-4" @click.stop="closeAction">
                Закрыть
              </v-btn>
            </v-col>
          </v-row>
        </slot>
      </template>
    </abp-simple-form>
    <abp-dialog v-model="insertedData" width="500" title="Данные добавлены">
      <v-card v-if="insertedData">
        <v-card-title>Документы созданы</v-card-title>
        <v-card-text
          v-for="(text, index) in dialogText"
          :key="`card_text_${index}`"
        >
          {{ text }}
        </v-card-text>
        <v-card-text v-if="invoice || act">
          Теперь Вы можете распечатать документы
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="invoice"
            color="primary"
            @click.stop="openPdf({ table: 'invoices', id: invoice.id })"
            >Печать счета</v-btn
          >
          <v-btn
            v-if="act"
            color="success"
            @click.stop="openPdf({ table: 'acts', id: act.id })"
            >Печать накладной</v-btn
          >
          <v-btn text @click.stop="closeAction">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPDocumentTableVue from "../Tables/ABPDocumentTable.vue";
import ABPSimpleFormVue from "./ABPSimpleForm.vue";
export default {
  name: "simple-invoice-form",
  components: {
    "abp-simple-form": ABPSimpleFormVue,
    "abp-document-table": ABPDocumentTableVue,
    "abp-dialog": ABPDialogVue,
  },
  props: {
    // форма в модальном окне
    inDialog: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    // выполним начальную инициализацию
    this.startInit();
  },
  data() {
    return {
      // заголовок формы
      title: "Простая форма создания счета/реализации",
      //   значения формы
      formValues: {
        // позиции заказа
        items: [],
        // контрагент - только юр.лицо в этом компоненте
        contractable_type: "App\\Kontragent",
        contractable_id: 1,
        // договор
        contract_id: null,
        //   нужно создавать новый договор
        createNewContract: true,
        // поля договора
        contract_num: null,
        contract_date: this.docDate,
        contract_type_id: null,
        // склад
        sklad_id: 1,
      },
      //   форма с крестиком
      isClosable: false,
      //   необходимые модели
      reqModels: ["contracts", "orders", "order_items", "invoices", "acts"],
      //   загруженные модели
      loadedModels: [],
      //   форма провалидирована
      formValid: false,
      //   таблица провалидирована
      tableValid: false,
      //   созданные записи
      contract: null,
      order: null,
      //   invoice: null,
      //   act: null,
      //   текст в диалоге
      dialogText: [],
      //   записи созданы
      insertedData: false,
    };
  },
  computed: {
    // вставленный счет
    invoice() {
      try {
        return this.order.invoices[0];
      } catch (error) {
        return null;
      }
    },
    // вставленная накладная
    act() {
      try {
        return this.order.acts[0];
      } catch (error) {
        return null;
      }
    },
    //   дата документов
    docDate() {
      return this.$moment().format("YYYY-MM-DD");
    },
    //   поля формы
    formFields() {
      let res = [];
      if (this.modelsLoaded) {
        // наша фирма и расчетный счет
        res.push({
          ...this.modelFields["contracts"]["rs_id"],
          ...{ title: "Организация и расчетный счет" },
        });
        // контрагент
        res.push({
          name: "contractable_id",
          title: "Контрагент",
          type: "select",
          required: true,
          table: "kontragents",
        });
        // переключатель - новый договор
        res.push({
          name: "createNewContract",
          title: "Договор",
          type: "radio",
          items: [
            { id: true, text: "Создать новый", color: "primary" },
            { id: false, text: "Выбрать существующий", color: "success" },
          ],
          size: 4,
        });
        // договор
        if (this.formValues.createNewContract) {
          // res.push(this.modelFields["contracts"].contract_num);
          // res.push(this.modelFields["contracts"].contract_date);
          res.push(this.modelFields["contracts"].contract_type_id);
        } else {
          res.push({
            name: "contract_id",
            title: "Договор",
            type: "select",
            required: true,
            table: "contracts",
            props: {
              chooseEqual: false,
              options: {
                keyModel: [
                  { contractable_type: this.formValues.contractable_type },
                  { contractable_id: this.formValues.contractable_id },
                  { rs_id: this.formValues.rs_id },
                ],
                fields: ["id", "contract_num", "contract_date"],
              },
            },
            disabled: !this.kontragetSelected || !this.rsSelected,
          });
        }
        // комментарий заказа
        res.push({
          ...this.modelFields["orders"]["comment"],
          ...{ title: "Комментарий заказа", required: true },
        });
        // склад отгрузки
        res.push({
          ...this.modelFields["acts"]["sklad_id"],
          ...{ title: "Склад отгрузки", require: true },
        });
      }
      return res;
    },
    // все модели загружены
    modelsLoaded() {
      return this.reqModels.length == this.loadedModels.length;
    },
    // поля всех моделей
    modelFields() {
      let res = {};
      if (this.modelsLoaded) {
        this.reqModels.forEach((table) => {
          let tableFields = {};
          try {
            this.$store.state.table.model[table].fields.forEach((field) => {
              tableFields[field.name] = field;
            });
            res[table] = tableFields;
          } catch (error) {
            // do nothing
          }
        });
      }
      return res;
    },
    // модель договора
    contractFields() {
      try {
        let res = {};
        this.$store.state.table.model.contracts.fields.forEach((field) => {
          res[field.name] = field;
        });
        return res;
      } catch (error) {
        return null;
      }
    },
    // контрагент
    kontragentId() {
      return this.formValues.contractable_id;
    },
    // контрагент выбран
    kontragetSelected() {
      try {
        return this.kontragentId > 1 ? true : false;
      } catch (error) {
        return false;
      }
    },
    // р/сч
    rsId() {
      return this.formValues.rs_id;
    },
    // р/с выбран
    rsSelected() {
      try {
        return this.rsId > 1 ? true : false;
      } catch (error) {
        return false;
      }
    },
    // кол-во записей в таблице
    itemsTotal() {
      return this.formValues.items.length;
    },
    // кол-во позиций накладной не удаленных
    undeletedItems() {
      return this.formValues.items.filter((item) => {
        return !item.deleted;
      }).length;
    },
    // полностью провалидирована форма и таблица
    fullValid() {
      return this.formValid && this.tableValid && this.undeletedItems > 0;
    },
  },
  methods: {
    ...mapActions([
      "getTableModel",
      "saveTableRow",
      "getPrintForm",
      "getPacketData",
    ]),
    // начальная инициализация
    startInit() {
      //   загрузим модели: contracts, orders, order_items, invoices, acts
      this.reqModels.forEach((table) => {
        this.getTableModel(table).then(() => {
          this.loadedModels.push(table);
        });
      });
    },
    // форма валидирована
    formValidated(isValid) {
      this.formValid = isValid;
    },
    // таблица провалидирована
    tableValidated(isValid) {
      this.tableValid = isValid;
    },
    // изменены данные формы
    changeVal() {
      this.$emit("input", this.formValues);
    },
    // Обработчик нажатия на кнопку ОК
    async submit() {
      //   console.log(`pressed OK with values=${JSON.stringify(this.formValues)}`);
      //   готовим данные в зависимости от того, создавался ли новый договор или нет
      if (this.formValues.createNewContract) {
        let payload = {
          // contract_num: this.formValues.contract_num,
          contract_date: this.docDate,
          contractable: {
            contractable_id: this.formValues.contractable_id,
            contractable_type: this.formValues.contractable_type,
          },
          comment: this.formValues.comment,
          rs_id: this.formValues.rs_id,
          orders: [
            {
              doc_date: this.docDate,
              comment: this.formValues.comment,
              items: this.formValues.items,
              invoices: [
                {
                  doc_date: this.docDate,
                  items: this.formValues.items,
                },
              ],
              acts: [
                {
                  sklad_id: this.formValues.sklad_id,
                  doc_date: this.docDate,
                  items: this.formValues.items,
                },
              ],
            },
          ],
        };
        // сохраняем сформированные данные
        this.contract = await this.saveTableRow({
          table: "contracts",
          modType: "add",
          values: payload,
        });
        // если получен договор
        if (this.contract) {
          try {
            let o = await this.getPacketData({
              table: "orders",
              options: {
                keyModel: [{ contract_id: this.contract.id }],
                odata: "data",
                limit: 1,
              },
            });
            this.order = o[0];
          } catch (error) {
            // нет заказа
          }
          //   если получен заказ
          if (this.order) {
            //   добавляем текст в диалог о создании договора
            if (this.contract)
              this.dialogText.push(
                `Добавлен договор ${this.contract.select_list_title}`
              );
            //   добавляем текст в диалог о создании заказа
            if (this.order)
              this.dialogText.push(
                `Добавлен заказ ${this.order.select_list_title}`
              );
            this.insertedData = true;
            // console.log(`insertData=${JSON.stringify(this.order)}`);
          } else {
            // console.log(`no order`);
          }
        }
      } else {
        //   к созданному ранее договору
        let payload = {
          contract_id: this.formValues.contract_id,
          doc_date: this.docDate,
          comment: this.formValues.comment,
          items: this.formValues.items,
          invoices: [
            {
              doc_date: this.docDate,
              items: this.formValues.items,
            },
          ],
          acts: [
            {
              sklad_id: this.formValues.sklad_id,
              doc_date: this.docDate,
              items: this.formValues.items,
            },
          ],
        };
        this.order = await this.saveTableRow({
          table: "orders",
          modType: "add",
          values: payload,
        });
        if (this.order) {
          this.insertedData = true;
          //   добавляем текст в диалог о создании заказа
          if (this.order)
            this.dialogText.push(
              `Добавлен заказ ${this.order.select_list_title}`
            );
          // console.log(`new order inserted= ${JSON.stringify(this.order)}`);
        }
      }
    },
    // закрытие формы
    closeAction() {
      // console.log(`close action`)
      // если диалоговое окно
      if (this.inDialog) {
        this.$emit("closeForm");
      } else {
        // если роут
        // this.$router.push(this.prevRoute)
        this.$router.go(-1);
      }
    },
    // открыть печатную форму
    openPdf({ table, id }) {
      this.getPrintForm({ table, id }).then((response) => {
        window.open(response, "_blank", `form_${table}_${id}_download`);
      });
      //   console.log(`open form for table ${table} , id=${id}`);
    },
  },
  watch: {
    // изменен контрагент
    kontragentId() {
      //   console.log(`kontragent changed`);
      this.formValues.contract_id = null;
    },
    // изменен р/сч
    rsId() {
      //   console.log(`rs changed`);
      this.formValues.contract_id = null;
    },
    // валидация формы
    fullValid(isValid) {
      this.$emit("validated", isValid);
    },
    // закрыт диалог крестьиком
    insertedData(isOpen) {
      if (!isOpen) this.closeAction();
    },
  },
};
</script>

<style lang="scss" scoped></style>
