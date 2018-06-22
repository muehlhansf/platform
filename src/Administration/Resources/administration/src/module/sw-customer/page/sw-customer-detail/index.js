import { Component, Mixin, State } from 'src/core/shopware';
import CriteriaFactory from 'src/core/factory/criteria.factory';
import template from './sw-customer-detail.html.twig';
import './sw-customer-detail.less';

Component.register('sw-customer-detail', {
    template,

    mixins: [
        Mixin.getByName('notification')
    ],

    beforeRouteLeave(to, from, next) {
        this.customerEditMode = false;
        next();
    },

    data() {
        return {
            customer: {},
            customerId: null,
            customerEditMode: false,
            customerGroups: [],
            applications: [],
            countries: [],
            addresses: [],
            paymentMethods: []
        };
    },

    computed: {
        customerStore() {
            return State.getStore('customer');
        },

        customerAddressStore() {
            return State.getStore('customer_address');
        },

        customerGroupStore() {
            return State.getStore('customer_group');
        },

        countryStore() {
            return State.getStore('country');
        },

        applicationStore() {
            return State.getStore('application');
        },

        paymentMethodStore() {
            return State.getStore('payment_method');
        },

        customerName() {
            const customer = this.customer;

            if (!customer.salutation && !customer.firstName && !customer.lastName) {
                return '';
            }

            const salutation = customer.salutation ? customer.salutation : '';
            const firstName = customer.firstName ? customer.firstName : '';
            const lastName = customer.lastName ? customer.lastName : '';

            return `${salutation} ${firstName} ${lastName}`;
        },

        isCreateCustomer() {
            return this.$route.name.includes('sw.customer.create');
        }
    },

    created() {
        this.createdComponent();
    },

    methods: {
        createdComponent() {
            if (this.$route.params.id) {
                this.customerId = this.$route.params.id;
                this.customer = this.customerStore.getById(this.customerId);
                const criteria = [];
                const params = {
                    limit: 100,
                    offset: 0
                };

                // todo this is a temporary solution for association loading
                criteria.push(CriteriaFactory.term('customer_address.customerId', this.customerId));
                params.criteria = CriteriaFactory.nested('AND', ...criteria);

                this.customer.addresses = this.customerAddressStore.getList(params).then((response) => {
                    this.customer.addresses = response.items;
                });

                this.applicationStore.getList({ offset: 0, limit: 100 }).then((response) => {
                    this.applications = response.items;
                });

                this.customerGroupStore.getList({ offset: 0, limit: 100 }).then((response) => {
                    this.customerGroups = response.items;
                });

                this.countryStore.getList({ offset: 0, limit: 100 }).then((response) => {
                    this.countries = response.items;
                });

                this.paymentMethodStore.getList({ offset: 0, limit: 100 }).then((response) => {
                    this.paymentMethods = response.items;
                });
            }

            if (this.$route.params.edit === 'edit') {
                this.customerEditMode = true;
            }
        },

        onSave() {
            const customerName = this.customerName;
            const titleSaveSuccess = this.$tc('sw-customer.detail.titleSaveSuccess');
            const messageSaveSuccess = this.$tc('sw-customer.detail.messageSaveSuccess', 0, { name: customerName });

            return this.customer.save().then(() => {
                this.customerEditMode = false;
                this.createNotificationSuccess({
                    title: titleSaveSuccess,
                    message: messageSaveSuccess
                });
            }).catch((exception) => {
                console.log(exception);
            });
        },

        onDisableCustomerEditMode() {
            this.customerEditMode = false;
        },

        onActivateCustomerEditMode() {
            this.customerEditMode = true;
        }
    }
});
