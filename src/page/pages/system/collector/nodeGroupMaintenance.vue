<template>
	<Box>
		<!--面包屑区域-->
		<div class="Breadcrumb">
			<el-breadcrumb>
				<el-breadcrumb-item>{{$t('breadcrumb.systemSetting')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.deviceAcquisitionSettings')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.nodeGroupMaintenance')}}</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<div class="padding20 borderBottom">
			<!--表单-->
			<el-form inline :model="formItem">
				<el-form-item :label="$t('nodeGroupMaintenance.groupName') + '：'">
					<el-input class="width200" v-model="formItem.groupName" @keyup.enter.native="getData()" clearable/>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" class="queryBtn" @click="getData">{{$t('public.query')}}</el-button>
					<el-button type="reset" class="queryBtn" @click="resetData">{{$t('public.reset')}}</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="padding20">
			<!--全局操作-->
			<div class="marBottom16">
				<el-button type="warning" class="queryBtn" @click="addDataBtn">
					<span class="iconfont fs14">&#xe689;</span>
					{{$t('public.add')}}
				</el-button>
				<el-button class="queryBtn" :disabled="disableBtn.edit" @click="editDataBtn">
					<span class="iconfont fs14">&#xe641;</span>
					{{$t('public.edit')}}
				</el-button>
				<el-button class="queryBtn" :disabled="disableBtn.more" @click="deleteData">
					<span class="iconfont fs14">&#xe647;</span>
					{{$t('public.delete')}}
				</el-button>
			</div>
			<!--表格-->
			<el-table :data="tableData" ref="table" border stripe @selection-change="selectTableNum">
				<el-table-column type="selection" fixed header-align="left" align="left"/>
				<el-table-column width="60px" :label="$t('public.index')" header-align="left" align="left">
					<template slot-scope="scope">
            <span>
              {{scope.$index+(options.currentPage - 1) * options.pageSize + 1}}
            </span>
					</template>
				</el-table-column>
				<el-table-column width="150px" prop="groupName" :label="$t('nodeGroupMaintenance.nodeGroupName')"
												 header-align="left" align="left"/>
				<el-table-column min-width="150px" :label="$t('nodeGroupMaintenance.IPList')" header-align="left" align="left">
					<template slot-scope="scope">
						<div v-for="(item,index) in scope.row.manageIpItem" :key="index">
							{{index + 1}}、{{item.startIp}} {{$t('nodeGroupMaintenance.to')}} {{item.endIp}}
							【{{$t('nodeGroupMaintenance.ip')}}:{{item.gatewayIp}}】
						</div>
					</template>
				</el-table-column>
				<el-table-column min-width="100px" prop="description" :label="$t('nodeGroupMaintenance.description')"
												 header-align="left" align="left"/>
				<el-table-column width="150px" prop="collectorCount" :label="$t('nodeGroupMaintenance.collectionNodesNum')"
												 header-align="left" align="left"/>
				<el-table-column width="150px" prop="createByUser" :label="$t('nodeGroupMaintenance.createName')"
												 header-align="left" align="left"/>
				<el-table-column width="160px" :label="$t('nodeGroupMaintenance.createTime')" header-align="left" align="left">
					<template slot-scope="scope">
						<span>{{scope.row.createTime | dateFilter}}</span>
					</template>
				</el-table-column>
			</el-table>
			<!--分页-->
			<pages
				:total='options.total'
				:currentPage='options.currentPage'
				:pageSize='options.pageSize'
				@handleSizeChangeSub="handleSizeChangeSub"
				@handleCurrentChangeSub="handleCurrentChange"/>
		</div>
		<!--新增编辑-->
		<el-dialog
			class="nodeGroup-dialog"
			append-to-body
			:title="$t('nodeGroupMaintenance.createUpdateNode')"
			:visible.sync="dialogVisible"
			:close-on-click-modal="false"
			:close-on-press-escape="false">
			<p class="nodeGroup-dialog-tip">
				<i class="el-icon-warning"></i>
				<span>
          {{$t('nodeGroupMaintenance.tip')}}
        </span>
			</p>
			<el-form label-width="96px" :model="addEdit" :rules="rules" ref="formName">
				<el-form-item class="star" :label="$t('nodeGroupMaintenance.nodeGroupName') + '：'" prop="groupName">
					<el-input class="width200" v-model="addEdit.groupName"/>
				</el-form-item>
				<el-form-item class="star" :label="$t('nodeGroupMaintenance.IPList') + '：'">
					<div v-for="(item,index) in IPListArr" :key="index" :class="(IPListArr.length - 1)?'marginBottom20':''">
						<div class="nodeGroup-formInputBox">
							<el-input :id="'IpListStart' + index" class="width200" @blur="rulesFormData(item,index,1)"
												v-model="item.startIp"/>
							<span class="isNotNull" v-if="item.startIpFlag">{{item.startIpTip}}</span>
						</div>
						<span>~</span>
						<div class="nodeGroup-formInputBox">
							<el-input :id="'IpListEnd' + index" class="width200" @blur="rulesFormData(item,index,2)"
												v-model="item.endIp"/>
							<span class="isNotNull" v-if="item.endIpFlag">{{item.endIpTip}}</span>
						</div>
						<div class="nodeGroup-formInputBox">
							<span>{{$t('nodeGroupMaintenance.ip')}}:</span>
							<el-input :id="'IpListGatewayIp' + index" class="width200" @blur="rulesFormData(item,index,3)"
												v-model="item.gatewayIp"/>
							<span class="marginLeft40 isNotNull" v-if="item.gatewayIpFlag">{{item.gatewayIpTip}}</span>
						</div>
						<el-button v-if="index == 0" @click="addIpList">+</el-button>
						<el-button v-else @click="deleteIpList(index)">-</el-button>
					</div>
				</el-form-item>
				<el-form-item :label="$t('nodeGroupMaintenance.note') + '：'">
					<el-input type="textarea" v-model="addEdit.description" :autosize="{minRows:3}"/>
				</el-form-item>
			</el-form>
			<span slot="footer">
        <el-button type="primary" class="alertBtn" v-if="ifAdd == true" @click="addData('formName')">{{$t('public.confirm')}}</el-button>
        <el-button type="primary" class="alertBtn" v-if="ifAdd == false" @click="editData('formName')">{{$t('public.confirm')}}</el-button>
        <el-button class="alertBtn" @click="resetFormData">{{$t('public.cancel')}}</el-button>
      </span>
		</el-dialog>
	</Box>
</template>

<script>
	import Box from '../../../../components/common/Box';
	import {dateFilter} from "../../../../assets/js/filters";
	import {isNotNull} from "../../../../assets/js/validator";

	export default {
		name: "nodeGroupMaintenance",
		components: {Box},
		data() {
			return {
				// 查询表单
				formItem: {
					groupName: null
				},
				addEdit: {
					id: '',
					groupName: '',
					description: ''
				},
				// 不为空集合
				isNotNull: {
					startIp: '',
					endIp: '',
					gatewayIp: ''
				},
				// 全局按钮判断
				disableBtn: {
					edit: true,
					more: true
				},
				tableData: [], // 表格数据集合
				checkListIds: [], // 选中表格的id集合
				IPListArr: [
					{
						startIp: '',
						startIpTip: '',
						startIpFlag: false,
						endIp: '',
						endIpTip: '',
						endIpFlag: false,
						gatewayIp: '',
						gatewayIpTip: '',
						gatewayIpFlag: false
					}
				],
				options: {
					total: 0, // 总条数
					currentPage: 1, // 当前页码
					pageSize: 10, // 每页显示条数
				},
				dialogVisible: false, // 新增编辑弹出层
				ifAdd: true, // 新增编辑判断
				// 表单校验
				rules: {
					groupName: [
						{validator: isNotNull, trigger: ['blur']}
					]
				}
			}
		},
		methods: {
			// 重置查询表单
			resetData() {
				var _t = this;
				_t.formItem.groupName = null;
			},
			// 重置表单
			resetFormData() {
				var _t = this;
				_t.ifAdd = true;
				_t.dialogVisible = false;
				_t.addEdit.id = '';
				_t.addEdit.groupName = '';
				_t.addEdit.description = '';
				_t.IPListArr = [
					{startIp: '', endIp: '', gatewayIp: '', startIpFlag: false, endIpFlag: false, gatewayIpFlag: false}
				];
				_t.$refs.table.clearSelection();
				_t.$refs.formName.resetFields(); //移除校验结果并重置字段值
				_t.$refs.formName.clearValidate(); //移除校验结果
				_t.IPListArr.forEach((item, index) => {
					document.getElementById('IpListStart' + index).style.borderColor = '#DCDFE6';
					document.getElementById('IpListEnd' + index).style.borderColor = '#DCDFE6';
					document.getElementById('IpListGatewayIp' + index).style.borderColor = '#DCDFE6';
				});
			},
			// 当前选中条数
			selectTableNum(data) {
				var _t = this;
				switch (data.length) {
					case 0: // 未选中
						_t.disableBtn.edit = true;
						_t.disableBtn.more = true;
						break;
					case 1: // 单选
						_t.disableBtn.edit = false;
						_t.disableBtn.more = false;
						break;
					default: // 多选
						_t.disableBtn.edit = true;
						_t.disableBtn.more = false;
						break;
				}
				var checkListIds = new Array();
				data.forEach(function (item) {
					checkListIds.push(item.id);
				});
				_t.checkListIds = checkListIds;
			},
			// 改变当前页码
			handleCurrentChange(val) {
				var _t = this;
				_t.options.currentPage = val;
				_t.getData();
			},
			// 改变每页显示条数
			handleSizeChangeSub(val) {
				var _t = this;
				_t.options.pageSize = val;
				_t.getData();
			},
			// 删除
			deleteData() {
				var _t = this;
				_t.$confirm(_t.$t('nodeGroupMaintenance.dialogDeleteTipText'), _t.$t('public.confirmTip'), {
					confirmButtonText: _t.$t('public.confirm'),
					cancelButtonText: _t.$t('public.close'),
					type: 'warning',
					confirmButtonClass: 'alertBtn',
					cancelButtonClass: 'alertBtn'
				}).then(() => {
					_t.$store.commit('setLoading', true);
					_t.$api.delete('system/collectorGroup/', {
						jsonString: JSON.stringify({
							systemCollectorGroup: {
								id: _t.checkListIds.join(',')
							}
						})
					}, function (res) {
						_t.$store.commit('setLoading', false);
						switch (res.status) {
							case 200:
								_t.$alert(_t.$t('nodeGroupMaintenance.dialogDeleteTip'), _t.$t('public.resultTip'), {
									confirmButtonText: _t.$t('public.confirm'),
									confirmButtonClass: 'alertBtn'
								});
								_t.getData();
								break;
							case 1003: // 无操作权限
							case 1004: // 登录过期
							case 1005: // token过期
							case 1006: // token不通过
								_t.exclude(_t, res.message);
								break;
							case 2007: // 删除失败
							case 3005: // 节点组关联角色不能删除
								_t.$alert(res.message, _t.$t('public.resultTip'), {
									confirmButtonText: _t.$t('public.confirm'),
									confirmButtonClass: 'alertBtn'
								}).then(() => {
									_t.getData();
								});
								break;
							default:
								break;
						}
					});
					_t.disableBtn.edit = true;
					_t.disableBtn.more = true;
				}).catch(() => {
					return;
				});
			},
			// 查询表格数据
			getData() {
				var _t = this;
				_t.$store.commit('setLoading', true);
				_t.$api.get('system/collectorGroup/pagelist', {
					jsonString: JSON.stringify({
						systemCollectorGroup: {
							groupName: _t.formItem.groupName == null ? null : _t.formItem.groupName
						},
						currentPage: _t.options.currentPage,
						pageSize: _t.options.pageSize
					})
				}, function (res) {
					_t.$store.commit('setLoading', false);
					switch (res.status) {
						case 200:
							var dataList = res.data.list === null ? [] : res.data.list;
							dataList.forEach(function (item) {
								item.manageIpItem = JSON.parse(item.manageIp);
							});
							_t.tableData = dataList;
							_t.options.total = res.data.count;
							_t.options.currentPage = res.data.currentPage;
							break;
						case 1003: // 无操作权限
						case 1004: // 登录过期
						case 1005: // token过期
						case 1006: // token不通过
							_t.exclude(_t, res.message);
							break;
						default:
							_t.tableData = [];
							_t.options.total = 0;
							_t.options.currentPage = 1;
							break;
					}
				});
			},
			// 新增按钮
			addDataBtn() {
				var _t = this;
				_t.ifAdd = true;
				_t.dialogVisible = true;
			},
			// 新增数据
			addData(formName) {
				var _t = this;
				// 判断ip地址段的数据是否输入
				var isErrorNull = 0;

				var IPListArr = new Array();
				_t.IPListArr.forEach(function (item, index) {
					_t.rulesFormData(item, index, 0);
					if (_t.rulesFormData(item, index) == false) {
						isErrorNull += 1;
					}
					var objIp = new Object();
					objIp.startIp = item.startIp;
					objIp.endIp = item.endIp;
					objIp.gatewayIp = item.gatewayIp;
					IPListArr.push(objIp);
				});
				_t.$refs[formName].validate((valid) => {
					if (valid && isErrorNull == 0) {
						_t.$api.post('system/collectorGroup/', {
							systemCollectorGroup: {
								groupName: _t.addEdit.groupName == null ? null : _t.addEdit.groupName.trim(),
								manageIp: IPListArr,
								description: _t.addEdit.description == null ? null : _t.addEdit.description.trim(),
								createBy: localStorage.getItem('hy-user-name'),
								languageMark: localStorage.getItem('hy-language')
							}
						}, function (res) {
							switch (res.status) {
								case 200:
									_t.getData();
									_t.resetFormData();
									break;
								case 1003: // 无操作权限
								case 1004: // 登录过期
								case 1005: // token过期
								case 1006: // token不通过
									_t.exclude(_t, res.message);
									break;
								case 3004: // 操作失败
									_t.$alert(res.message, _t.$t('public.resultTip'), {
										confirmButtonText: _t.$t('public.confirm'),
										confirmButtonClass: 'alertBtn'
									}).then(() => {
										_t.resetFormData();
									});
									break;
								default:
									break;
							}
						});
					}
				});
			},
			// 校验ip地址开始段
			// ip地址段的校验
			rulesFormData(data, index, val) {
				var _t = this;
				var isNotNull = 0;
				var ipTipText = 'IP格式不正确,请重新输入!';
				// 校验 开始 ip
				if (data.startIp.trim() == '') {
					isNotNull += 1;
					data.startIpTip = _t.$t('public.isNotNull');
					data.startIpFlag = true;
					document.getElementById('IpListStart' + index).style.borderColor = '#fb6041';
				} else if (_t.$api.isIpNumber().test(data.startIp) === false) {
					isNotNull += 1;
					data.startIpTip = ipTipText;
					data.startIpFlag = true;
					document.getElementById('IpListStart' + index).style.borderColor = '#fb6041';
				} else {
					data.startIpTip = '';
					data.startIpFlag = false;
					document.getElementById('IpListStart' + index).style.borderColor = '#DCDFE6';
				}
				if (val == 1) {
					return false;
				}
				// 校验 结束 ip
				if (data.endIp.trim() == '') {
					isNotNull += 1;
					data.endIpTip = _t.$t('public.isNotNull');
					data.endIpFlag = true;
					document.getElementById('IpListEnd' + index).style.borderColor = '#fb6041';
				} else if (_t.$api.isIpNumber().test(data.endIp) === false) {
					isNotNull += 1;
					data.endIpTip = ipTipText;
					data.endIpFlag = true;
					document.getElementById('IpListEnd' + index).style.borderColor = '#fb6041';
				} else {
					data.endIpTip = '';
					data.endIpFlag = false;
					document.getElementById('IpListEnd' + index).style.borderColor = '#DCDFE6';
				}
				if (val == 2) {
					return false;
				}
				// 校验 网关 ip
				if (data.gatewayIp.trim() == '') {
					isNotNull += 1;
					data.gatewayIpTip = _t.$t('public.isNotNull');
					data.gatewayIpFlag = true;
					document.getElementById('IpListGatewayIp' + index).style.borderColor = '#fb6041';
				} else if (_t.$api.isIpNumber().test(data.gatewayIp) === false) {
					isNotNull += 1;
					data.gatewayIpTip = ipTipText;
					data.gatewayIpFlag = true;
					document.getElementById('IpListGatewayIp' + index).style.borderColor = '#fb6041';
				} else {
					data.gatewayIpTip = '';
					data.gatewayIpFlag = false;
					document.getElementById('IpListGatewayIp' + index).style.borderColor = '#DCDFE6';
				}
				// true 代表 可以提交 false 代表不可以提交
				return isNotNull > 0 ? false : true;
			},
			// 编辑按钮
			editDataBtn() {
				var _t = this;
				_t.ifAdd = false;
				_t.dialogVisible = true;
				_t.addEdit.id = _t.checkListIds.join(',');
				_t.getEditDataById(_t.addEdit.id);
			},
			// 编辑数据
			editData(formName) {
				var _t = this;
				// 判断ip地址段的数据是否输入
				var isErrorNull = 0;
				var IPListArr = new Array();
				_t.IPListArr.forEach(function (item, index) {
					_t.rulesFormData(item, index, 0);
					if (_t.rulesFormData(item, index) == false) {
						isErrorNull += 1;
					}
					var objIp = new Object();
					objIp.startIp = item.startIp;
					objIp.endIp = item.endIp;
					objIp.gatewayIp = item.gatewayIp;
					IPListArr.push(objIp);
				});
				_t.$refs[formName].validate((valid) => {
					if (valid && isErrorNull == 0) {
						_t.$api.put('system/collectorGroup/', {
							systemCollectorGroup: {
								id: _t.checkListIds.join(','),
								groupName: _t.addEdit.groupName == null ? null : _t.addEdit.groupName.trim(),
								manageIp: IPListArr,
								description: _t.addEdit.description == null ? null : _t.addEdit.description.trim(),
								createBy: localStorage.getItem('hy-user-name'),
								languageMark: localStorage.getItem('hy-language')
							}
						}, function (res) {
							switch (res.status) {
								case 200:
									_t.getData();
									_t.resetFormData();
									break;
								case 1003: // 无操作权限
								case 1004: // 登录过期
								case 1005: // token过期
								case 1006: // token不通过
									_t.exclude(_t, res.message);
									break;
								case 3004: // 操作失败
									_t.$alert(res.message, _t.$t('public.resultTip'), {
										confirmButtonText: _t.$t('public.confirm'),
										confirmButtonClass: 'alertBtn'
									}).then(() => {
										_t.resetFormData();
									});
									break;
								default:
									break;
							}
						});
					}
				});
			},
			// 根据选中id查询编辑数据
			getEditDataById(val) {
				var _t = this;
				_t.$api.get('system/collectorGroup/' + val, {}, function (res) {
					switch (res.status) {
						case 200:
							_t.addEdit.id = res.data.id;
							_t.addEdit.groupName = res.data.groupName;
							_t.addEdit.description = res.data.description;
							var IPListArr = JSON.parse(res.data.manageIp);
							if (IPListArr.length !== 0) {
								IPListArr.forEach((t)=>{
									t.startIpFlag = false;
									t.endIpFlag = false;
									t.gatewayIpFlag = false;
									t.startIpTip = '';
									t.endIpTip = '';
									t.gatewayIpTip = '';
								});
							}
							_t.IPListArr = IPListArr;
							break;
						case 1003: // 无操作权限
						case 1004: // 登录过期
						case 1005: // token过期
						case 1006: // token不通过
							_t.exclude(_t, res.message);
							break;
						default:
							break;
					}
				});
			},
			// 添加ip地址段
			addIpList() {
				var _t = this;
				var ipObj = new Object();
				ipObj.startIp = '';
				ipObj.startIpFlag = false;
				ipObj.startIpTip = '';
				ipObj.endIp = '';
				ipObj.endIpFlag = false;
				ipObj.endIpTip = '';
				ipObj.gatewayIp = '';
				ipObj.gatewayIpFlag = false;
				ipObj.gatewayIpTip = '';
				_t.IPListArr.push(ipObj);
			},
			// 删除ip地址段
			deleteIpList(index) {
				var _t = this;
				_t.IPListArr.splice(index, 1);
			}
		},
		created() {
			this.$store.commit('setLoading', true);
			this.getData();
		}
	}
</script>

<style>
	.nodeGroup-dialog .el-dialog {
		width: 876px;
		height: 426px;
	}

	.nodeGroup-dialog-tip {
		background-color: #fdf6ec;
		font-size: 12px;
		color: #d99815;
		padding: 8px 10px;
		display: flex;
		margin-bottom: 20px;
	}

	.nodeGroup-dialog-tip i {
		width: 30px;
		height: 35px;
		line-height: 35px;
		color: #d99815;
		font-size: 14px;
	}

	.nodeGroup-dialog-tip span {
		flex: 1;
	}

	.nodeGroup-formInputBox {
		position: relative;
		display: inline-block;
	}
</style>
