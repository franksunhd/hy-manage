<template>
	<Box>
		<!--面包屑区域-->
		<div class="Breadcrumb">
			<el-breadcrumb>
				<el-breadcrumb-item>{{$t('breadcrumb.systemSetting')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.dataBaseManagement')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.dataBaseBackUp')}}</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="padding20 borderBottom">
			<!--表单-->
			<el-form inline>
				<el-form-item :label="$t('dataBaseBackUp.dataBaseType') + '：'">
					<span>MySQL</span>
				</el-form-item>
				<el-form-item :label="$t('dataBaseBackUp.dataBaseName') + '：'">
					<el-select v-model="dataBaseName">
						<el-option v-for="(item,index) in dataBaseList"
											 :key="index"
											 :label="item.label"
											 :value="item.value"/>
					</el-select>
				</el-form-item>
				<br>
				<el-form-item :label="$t('dataBaseBackUp.backUpDirectory') + '：'">
					<span>/mysql-5.7.12-winx64/backup/{yyyyMMdd}/{库名/表名}_{时间戳}.sql</span>
				</el-form-item>
			</el-form>
		</div>
		<div class="padding20">
			<!--全局操作-->
			<div class="marBottom16">
				<el-button @click="backUpAllTable">{{$t('dataBaseBackUp.backUpAllTable')}}</el-button>
				<el-button @click="backUpThisDataBase">{{$t('dataBaseBackUp.backUpThisDataBase')}}</el-button>
			</div>
			<!--表格-->
			<el-table :data="tableData" stripe border>
				<el-table-column type="selection" fixed/>
				<el-table-column :label="$t('public.index')" width="100" header-align="left" align="left"/>
				<el-table-column :label="$t('dataBaseBackUp.tableName')" width="200" header-align="left" align="left"/>
				<el-table-column :label="$t('dataBaseBackUp.tableDes')" header-align="left" align="left"/>
			</el-table>
		</div>
	</Box>
</template>

<script>
	import Box from '../../../../components/common/Box';

	export default {
		name: "dataBaseBackUp",
		components: {Box},
		data() {
			return {
				dataBaseName: '',
				dataBaseList: [
					{value: 1, label: 'bmsDB'},
					{value: 2, label: 'bmsData'},
				],
				tableData: []
			}
		},
		methods: {
			// 备份以下选中的表
			backUpAllTable() {
				var _t = this;
				_t.$confirm(_t.$t('dataBaseBackUp.dialogTip'), _t.$t('public.confirmTip'), {
					confirmButtonText: _t.$t('public.confirm'),
					cancelButtonText: _t.$t('public.close'),
					type: 'warning',
					confirmButtonClass: 'alertBtn',
					cancelButtonClass: 'alertBtn'
				}).then(() => {
					_t.$alert(_t.$t('dataBaseBackUp.dialogSuccessTip'), _t.$t('public.resultTip'));
				}).catch(() => {
					return;
				});
			},
			// 备份当前选中的数据库
			backUpThisDataBase() {
				var _t = this;
				_t.$confirm(_t.$t('dataBaseBackUp.dialogTip'), _t.$t('public.confirmTip'), {
					confirmButtonText: _t.$t('public.confirm'),
					cancelButtonText: _t.$t('public.close'),
					type: 'warning',
					confirmButtonClass: 'alertBtn',
					cancelButtonClass: 'alertBtn'
				}).then(() => {
					_t.$alert(_t.$t('dataBaseBackUp.dialogSuccessTip'), _t.$t('public.resultTip'));
				}).catch(() => {
					return;
				});
			}
		},
		created() {
		}
	}
</script>

<style scoped>

</style>
