<template>
	<Box>
		<!--面包屑区域-->
		<div class="Breadcrumb">
			<el-breadcrumb>
				<el-breadcrumb-item>{{$t('breadcrumb.alarmManagement')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.alarmSettings')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.basicSettings')}}</el-breadcrumb-item>
				<el-breadcrumb-item>{{$t('breadcrumb.alarmGroupSettings')}}</el-breadcrumb-item>
			</el-breadcrumb>
		</div>
		<!--表单-->
		<div class="padding20 borderBottom">
			<el-form inline :model="formItem">
				<el-form-item :label="$t('alarmGroupSettings.groupName') + '：'">
					<el-input v-model="formItem.groupName" clearable/>
				</el-form-item>
				<el-form-item :label="$t('alarmGroupSettings.ipName') + '：'">
					<el-input v-model="formItem.ip" clearable/>
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
				<el-button type="warning" @click="addDataBtn" class="queryBtn">
					<i class="el-icon-circle-plus-outline"></i> {{$t('public.add')}}
				</el-button>
				<el-button :disabled="disableBtn.edit" @click="editDataBtn" class="queryBtn">
					<i class="el-icon-edit-outline"></i> {{$t('public.edit')}}
				</el-button>
				<el-button :disabled="disableBtn.more" @click="deleteData" class="queryBtn">
					<i class="el-icon-delete"></i> {{$t('public.delete')}}
				</el-button>
			</div>
			<el-table :data="tableData" stripe border ref="table" @selection-change="selectTableNum">
				<el-table-column type="selection" fixed header-align="left" align="left"/>
				<el-table-column width="60px" :label="$t('public.index')" header-align="left" align="left">
					<template slot-scope="scope">
						<span>
							{{scope.$index+(options.currentPage - 1) * options.pageSize + 1}}
						</span>
					</template>
				</el-table-column>
				<el-table-column prop="name" :label="$t('alarmGroupSettings.groupName')" header-align="left" align="left"/>
				<el-table-column prop="assetCount" :label="$t('alarmGroupSettings.deviceNum')" header-align="left"
												 align="left"/>
				<el-table-column prop="createByUser" :label="$t('alarmGroupSettings.createBy')" header-align="left" align="left"/>
				<el-table-column :label="$t('alarmGroupSettings.createTime')" header-align="left" align="left">
					<template slot-scope="scope">
						<span>{{scope.row.createTime | dateFilter}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="lastModifyByUser" :label="$t('alarmGroupSettings.updateName')" header-align="left"
												 align="left"/>
				<el-table-column :label="$t('alarmGroupSettings.updateTime')" header-align="left" align="left">
					<template slot-scope="scope">
						<span>{{scope.row.lastModifyTime | dateFilter}}</span>
					</template>
				</el-table-column>
			</el-table>
			<!--分页-->
			<pages
				:total='options.total'
				:currentPage='options.currentPage'
				:page-size="options.pageSize"
				@handleSizeChangeSub="handleSizeChangeSub"
				@handleCurrentChangeSub="handleCurrentChange"/>
		</div>
		<!--新增编辑弹出层-->
		<el-dialog
			class="alarmGroupSettings-dialog"
			append-to-body
			:title="$t('alarmGroupSettings.addEditTitle')"
			:visible.sync="dialogVisible"
			:close-on-click-modal="false"
			:close-on-press-escape="false">
			<el-form :model="addEdit" :rules="rules" ref="ruleForm">
				<el-form-item label-width="96px" :label="$t('alarmGroupSettings.groupName') + '：'" prop="groupName">
					<el-input v-model="addEdit.groupName" clearable class="width200"/>
				</el-form-item>
				<el-form-item label-width="96px" :label="$t('alarmGroupSettings.deviceView') + '：'">
					<el-radio-group class="fl" v-model="addEdit.viewStatus">
						<el-radio label="1" border>{{$t('alarmGroupSettings.resourceView')}}</el-radio>
						<!--							<el-radio label="2" border>{{$t('alarmGroupSettings.businessView')}}</el-radio>-->
						<!--							<el-radio label="3" border>{{$t('alarmGroupSettings.roomView')}}</el-radio>-->
					</el-radio-group>
					<div class="fr">
						<el-button type="text" @click="importFormRole">
								<span class="middle">
									<span class="iconfont">&#xe69c;</span>
									<span>{{$t('alarmGroupSettings.importRole')}}</span>
								</span>
						</el-button>
					</div>
				</el-form-item>
				<div class="role-dialog-line">
					<div class="line"></div>
				</div>
				<el-form-item style="margin-bottom: 10px;">
					<el-input v-model="filterText" class="width200 role-input-search" :placeholder="$t('alarmGroupSettings.tip')"/>
				</el-form-item>
				<el-form-item>
					<el-checkbox
						class="role-dialog-checkout"
						v-model="allcheckedData"
						@change="checkedAllData(allcheckedData)">
						{{$t('public.allChecked')}}
					</el-checkbox>
					<el-tree
						id="alarmGroup-box"
						node-key="nodeId"
						:data="dataInfoResourceTree"
						:props="dataInfoTreeProps"
						show-checkbox
						:default-expanded-keys="['tree_other']"
						@check-change="currentChangeTree"
						:filter-node-method="filterNode"
						ref="vueTree">
						<div slot-scope="{node,data}" :class="data.orderNum == 2 ? 'treeBox activeColor' : 'treeBox'">
							<span v-if="data.orderNum === 2" class="iconfont">&#xe663;</span>
							<span>{{data.nodeName}}</span>
							<span v-if="data.orderNum === 2">({{data.ip}})</span>
						</div>
					</el-tree>
					<p class="iconfontError">
						<span>{{$t('alarmGroupSettings.selectedDevice')}}</span>
						<span>{{addEdit.isSelectNum}}</span>
						<span>{{$t('alarmGroupSettings.stand')}}</span>
					</p>
				</el-form-item>
			</el-form>
			<!--从角色导入-->
			<el-dialog
				class="alarmGroupSettings-role-dialog"
				append-to-body
				:title="$t('alarmGroupSettings.addEditTitle')"
				:visible.sync="dialogVisibleInner"
				:before-close="resetRoleGroup"
				:close-on-click-modal="false"
				:close-on-press-escape="false">
				<el-checkbox-group v-model="checkListRole">
					<div class="marBottom10" v-for="(item,index) in orgRoleList" :key="index">
						<el-checkbox :label="item.id">{{item.roleName}}</el-checkbox>
						<br>
					</div>
				</el-checkbox-group>
				<div slot="footer">
					<el-button type="primary" class="alertBtn" @click="importRoleBtn">
						{{$t('public.confirm')}}
					</el-button>
					<el-button class="alertBtn" @click="dialogVisibleInner=false;">{{$t('public.close')}}</el-button>
				</div>
			</el-dialog>
			<div slot="footer">
				<el-button type="primary" class="alertBtn" v-if="ifAdd === true" @click="addData('ruleForm')">
					{{$t('public.confirm')}}
				</el-button>
				<el-button type="primary" class="alertBtn" v-if="ifAdd === false" @click="editData('ruleForm')">
					{{$t('public.confirm')}}
				</el-button>
				<el-button class="alertBtn" @click="resetFormData">{{$t('public.close')}}</el-button>
			</div>
		</el-dialog>
	</Box>
</template>

<script>
	import Box from '../../../../components/common/Box';
	import {dateFilter} from "../../../../assets/js/filters";
	import {getObjectById,uniqArr} from "../../../../assets/js/recursive";
	import {isNotNull} from "../../../../assets/js/validator";

	export default {
		name: 'alarm-group-settings',
		components: {Box},
		data() {
			return {
				// 查询表单
				formItem: {
					groupName: null,
					ip: null
				},
				// 新增编辑
				addEdit: {
					groupName: '',
					viewStatus: '1',
					isSelectNum: 0
				},
				// 启用禁用操作 
				disableBtn: {
					edit: true,
					more: true
				},
				// 分页
				options: {
					currentPage: 1,
					total: 0,
					pageSize: 10
				},
				filterText: '', // 名称前端过滤
				tableData: [], // 表格数据
				dataInfoResourceTree: [], // 资源视图树
				deviceListArr: [], // 资源视图全选数据集合
				defaultExpandedKeys: [], // 从角色导入默认展开第一个节点
				orgRoleList: [], // 从角色导入树形
				checkIdsList:[], // 表格选中的id集合
				checkListRole:[], // 从角色导入 选中角色集合
				dialogVisible: false, // 新增编辑弹出层
				dialogVisibleInner: false, // 从角色导入弹出层
				ifAdd: true, // 是否新增
				allcheckedData: false, // 数据权限全选
				// 资源视图树
				dataInfoTreeProps: {
					label: 'nodeName',
					children: 'children'
				},
				// 从角色导入树
				orgRoleListProps: {
					label: 'nodeName',
					children: 'children',
					disabled: function (data, node) {
						if (data.level === 1) {
							// 类型为1 组织类型 禁用隐藏复选框
							return true;
						} else if (data.level === 3) {
							// 类型为3 用户类型 不显示
							node.visible = false;
						}
					}
				},
				// 表单校验
				rules: {
					groupName:[
						{validator: isNotNull, trigger: ['blur']}
					]
				}
			}
		},
		// 监听
		watch: {
			filterText(val) {
				this.$refs.vueTree.filter(val);
			}
		},
		methods: {
			// 重置角色导入
			resetRoleGroup(){
				var _t= this;
				_t.dialogVisibleInner = false;
				_t.checkListRole = [];
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
						var checkListIds = new Array();
						data.forEach((item)=>{
							checkListIds.push(item.id);
						});
						_t.checkIdsList = checkListIds;
						break;
					default: // 多选
						_t.disableBtn.edit = true;
						_t.disableBtn.more = false;
						var checkListIds = new Array();
						data.forEach((item)=>{
							checkListIds.push(item.id);
						});
						_t.checkIdsList = checkListIds;
						break;
				}
				// 选中的表格集合
				_t.checkListValue = data;
			},
			// 导入角色保存
			importRoleBtn() {
				var _t = this;
				var selectRoleList = _t.checkListRole;
				_t.$api.get('system/systemRoleDevice/resourceViewDataEcho',{
					jsonString:JSON.stringify({
						systemRoleDevice:{
							roleId:selectRoleList.join(',') === '' ? null : selectRoleList.join(',')
						}
					})
				},function (res) {
					switch (res.status) {
						case 200:
							// 先获取目前已选的节点
							var isSelectedArr = _t.$refs.vueTree.getCheckedKeys();
							var returnListArr = res.data.list === null ? [] : res.data.list;
							returnListArr.forEach((item)=>{
								isSelectedArr.push(item);
							});
							isSelectedArr = uniqArr(isSelectedArr).length === 0 ? [] : uniqArr(isSelectedArr);
							_t.$refs.vueTree.setCheckedKeys(isSelectedArr);
							_t.resetRoleGroup();
							break;
						case 1003: // 无操作权限
						case 1004: // 登录过期
						case 1005: // token过期
						case 1006: // token不通过
							_t.exclude(_t, res.message);
							break;
						default:
							_t.resetRoleGroup();
							break;
					}
				});
			},
			// 树节点状态改变的时候 判断是否勾选全选按钮
			currentChangeTree() {
				var _t = this;
				var selectTreeList = _t.$refs.vueTree.getCheckedNodes();
				var selectTreeArr = new Array();
				var selectFirstLevel = new Array();
				selectTreeList.forEach((t)=>{
					if (t.orderNum === 2) {
						selectTreeArr.push(t.nodeId);
					}
					// 获取选中目录集合
					if (t.orderNum === 1) {
						selectFirstLevel.push(t.nodeId);
					}
				});
				// 给选中多少台设备赋值
				_t.addEdit.isSelectNum = selectTreeArr.length;
				// 判断树节点是否全部勾选 一级的节点全部选中 代表全选
				var firstLevelNum = 0;
				if (_t.dataInfoResourceTree !== null) {
					_t.dataInfoResourceTree.forEach((item)=>{
						selectFirstLevel.forEach((val)=>{
							if (item.nodeId === val) {
								firstLevelNum++;
							}
						})
					});
				}
				// 判断 一级节点个数不为0 并且
				if (firstLevelNum !== 0 && firstLevelNum === _t.dataInfoResourceTree.length) {
					_t.allcheckedData = true;
				} else {
					_t.allcheckedData = false;
				}
			},
			// 数据权限 全选
			checkedAllData() {
				var _t = this;
				if (_t.allcheckedData) {
					// 全选
					_t.$refs.vueTree.setCheckedNodes(_t.dataInfoResourceTree);
				} else {
					// 取消全选
					_t.$refs.vueTree.setCheckedKeys([]);
				}
			},
			// 过滤树
			filterNode(value, data) {
				if (!value) return true;
				return data.nodeName.indexOf(value) !== -1;
			},
			// 添加按钮
			addDataBtn() {
				var _t = this;
				_t.ifAdd = true;
				_t.dialogVisible = true;
				_t.getInfoDataTree();
			},
			// 新增提交
			addData(formName) {
				var _t = this;
				var deviceIdArrList = _t.$refs.vueTree.getCheckedNodes();
				var selectTreeKeys = new Array();
				deviceIdArrList.forEach((item)=>{
					if (item.orderNum === 2) {
						selectTreeKeys.push(item.nodeId);
					}
				});
				_t.$refs[formName].validate((valid) => {
					if (valid && selectTreeKeys.length !== 0) {
						_t.$api.post('alarm/noticeGroup/',{
							alarmNoticeGroup:{
								viewType:_t.addEdit.viewStatus,
								name:_t.addEdit.groupName,
								assetId:selectTreeKeys.join(','),
							}
						},function (res) {
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
								default:
									_t.resetFormData();
									break;
							}
						});
					}
				});
			},
			// 编辑提交
			editData(formName){
				var _t = this;
				var deviceIdArrList = _t.$refs.vueTree.getCheckedNodes();
				var selectTreeKeys = new Array();
				deviceIdArrList.forEach((item)=>{
					if (item.orderNum === 2) {
						selectTreeKeys.push(item.nodeId);
					}
				});
				_t.$refs[formName].validate((valid) => {
					if (valid && selectTreeKeys.length !== 0) {
						_t.$api.put('alarm/noticeGroup/',{
							alarmNoticeGroup:{
								id:_t.checkIdsList.join(','),
								viewType:_t.addEdit.viewStatus,
								name:_t.addEdit.groupName,
								assetId:selectTreeKeys.join(','),
							}
						},function (res) {
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
								default:
									_t.resetFormData();
									break;
							}
						});
					}
				});
			},
			// 编辑按钮
			editDataBtn() {
				var _t = this;
				_t.ifAdd = false;
				_t.dialogVisible = true;
				_t.getInfoDataTree();
			},
			// 删除按钮
			deleteData() {
				var _t = this;
				_t.$confirm(_t.$t('alarmGroupSettings.dialogDeleteTipText'), _t.$t('public.confirmTip'), {
					confirmButtonText: _t.$t('public.confirm'),
					cancelButtonText: _t.$t('public.close'),
					type: 'warning',
					confirmButtonClass: 'alertBtn',
					cancelButtonClass: 'alertBtn'
				}).then(() => {
					_t.$store.commit('setLoading', true);
					_t.$api.delete('alarm/noticeGroup/', {
						jsonString: JSON.stringify({
							id: _t.checkIdsList.join(',')
						})
					}, function (res) {
						_t.$store.commit('setLoading', false);
						switch (res.status) {
							case 200:
								_t.$alert(_t.$t('alarmGroupSettings.dialogDeleteTip'), _t.$t('public.resultTip'), {
									confirmButtonText: _t.$t('public.confirm'),
									confirmButtonClass: 'alertBtn'
								}).then(() => {
									_t.getData();
									_t.$refs.table.clearSelection();
								});
								break;
							case 1003: // 无操作权限
							case 1004: // 登录过期
							case 1005: // token过期
							case 1006: // token不通过
								_t.exclude(_t, res.message);
								break;
							case 2007: // 删除失败
							case 3005: // 关联规则
								_t.$alert(res.message, _t.$t('public.resultTip'), {
									confirmButtonText: _t.$t('public.confirm'),
									confirmButtonClass: 'alertBtn'
								}).then(() => {
									_t.getData();
									_t.$refs.table.clearSelection();
								});
								break;
							default:
								_t.getData();
								_t.$refs.table.clearSelection();
								break;
						}
						_t.disableBtn.edit = true;
						_t.disableBtn.more = true;
					});
				}).catch(() => {
					return;
				});
			},
			// 从角色中导入
			importFormRole() {
				var _t = this;
				_t.dialogVisibleInner = true;
				_t.getOrgRoleList();
			},
			// 重置表单
			resetFormData() {
				var _t = this;
				_t.ifAdd = true;
				_t.addEdit.groupName = '';
				_t.addEdit.isSelectNum = 0;
				_t.dialogVisible = false;
				_t.$refs.vueTree.setCheckedKeys([]);
				_t.allcheckedData = false;
			},
			// 重置表单数据
			resetData() {
				var _t = this;
				_t.formItem.groupName = null;
				_t.formItem.ip = null;
			},
			// 查询列表数据
			getData() {
				var _t = this;
				_t.$store.commit('setLoading', true);
				_t.$api.get('alarm/noticeGroup/pagelist', {
					jsonString: JSON.stringify({
						alarmNoticeGroup: {
							name: _t.formItem.groupName == null ? null : (_t.formItem.groupName.trim() == '' ? null : _t.formItem.groupName.trim()),
							assetName: _t.formItem.ip == null ? null : (_t.formItem.ip.trim() == '' ? null : _t.formItem.ip.trim())
						},
						currentPage: _t.options.currentPage,
						pageSize: _t.options.pageSize
					})
				}, function (res) {
					_t.$store.commit('setLoading', false);
					switch (res.status) {
						case 200:
							_t.tableData = res.data.list === null ? [] : res.data.list;
							_t.options.currentPage = res.data.currentPage;
							_t.options.total = res.data.count;
							break;
						case 1003: // 无操作权限
						case 1004: // 登录过期
						case 1005: // token过期
						case 1006: // token不通过
							_t.exclude(_t, res.message);
							break;
						default:
							_t.tableData = [];
							_t.options.currentPage = 1;
							_t.options.total = 0;
							break;
					}
				});
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
			// 获取数据权限 监测目录树
			getInfoDataTree() {
				var _t = this;
				_t.$store.commit('setLoading', true);
				_t.$api.get('asset/assetCatalog/all', {}, function (res) {
					_t.$store.commit('setLoading', false);
					switch (res.status) {
						case 200:
							var dataInfoResourceTree = res.data.children === null ? [] : res.data.children;
							dataInfoResourceTree.unshift({
								nodeId: 'tree_other',
								orderNum: 1,
								nodeName: _t.$t('alarmGroupSettings.isNotDirectory'),
								children: []
							});
							// 获取设备列表集合
							_t.getDeviceTreeData(dataInfoResourceTree);
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
			// 获取设备列表
			getDeviceTreeData(tree) {
				var _t = this;
				_t.$store.commit('setLoading', true);
				_t.$api.get('asset/assetDevice/getDeviceList', {
					jsonString: JSON.stringify({
						assetDevice: {
							monitorStatus:1
						}
					})
				}, function (res) {
					_t.$store.commit('setLoading', false);
					switch (res.status) {
						case 200:
							var deviceList = res.data.list === null ? [] : res.data.list;
							var deviceListObject = new Object();
							deviceList.forEach((item) => {
								item.nodeId = item.id;
								item.parentId = item.catalogId;
								item.nodeName = item.deviceName;
								item.orderNum = 2;
								if (item.children === undefined) {
									item.children = [];
								}
								// 未发现设备
								if (item.catalogId === null) {
									if (deviceListObject['tree_other'] !== undefined) {
										deviceListObject['tree_other'].push(item);
									} else {
										deviceListObject['tree_other'] = [];
										deviceListObject['tree_other'].push(item);
									}
								} else {
									// 已发现的设备
									if (deviceListObject[item.catalogId] !== undefined) {
										deviceListObject[item.catalogId].push(item);
									} else {
										deviceListObject[item.catalogId] = [];
										deviceListObject[item.catalogId].push(item);
									}
								}
							});
							// 将键值存到数组中 用于遍历
							var keyArr = new Array();
							for (var key in deviceListObject) {
								keyArr.push(key);
							}
							keyArr.forEach((item) => {
								var nodeList = getObjectById(tree, item, 'nodeId', 'children');
								if (nodeList[0] && nodeList[0].nodeId === item) {
									if (nodeList[0].children.length !== 0) {
										deviceListObject[item].forEach((data)=>{
											nodeList[0].children.unshift(data);
										});
									} else {
										nodeList[0].children = deviceListObject[item];
									}
								}
							});
							var deviceListArr = new Array();
							deviceList.forEach((item) => {
								deviceListArr.push(item);
							});
							// 可选的设备id集合
							_t.deviceListArr = deviceListArr;
							// 渲染可选的设备目录及设备树
							_t.dataInfoResourceTree = tree;
							if (_t.ifAdd === false) {
								// 获取回显的编辑数据
								_t.getDataFromEdit(_t.checkIdsList.join(','));
							}
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
			// 从角色导入数据接口
			getOrgRoleList() {
				var _t = this;
				_t.$store.commit('setLoading', true);
				_t.$api.get('system/role/all', {}, function (res) {
					_t.$store.commit('setLoading', false);
					switch (res.status) {
						case 200:
							if (res.data !== null) {
								_t.orgRoleList = res.data.list === null ? [] : res.data.list;
							}
							break;
						case 1003: // 无操作权限
						case 1004: // 登录过期
						case 1005: // token过期
						case 1006: // token不通过
							_t.exclude(_t, res.message);
							break;
						default:
							_t.orgRoleList = [];
							break;
					}
				});
			},
			// 获取编辑回显的数据
			getDataFromEdit(alarmId){
				var _t = this;
				_t.$api.get('alarm/noticeGroup/alarmGroupDataEcho',{
					jsonString:JSON.stringify({
						alarmNoticeGroup:{
							id:alarmId
						}
					})
				},function (res) {
					switch (res.status) {
						case 200:
							var returnData = res.data;
							returnData.alarmNoticeGroupAssetList = returnData.alarmNoticeGroupAssetList === null ? [] : returnData.alarmNoticeGroupAssetList;
							_t.addEdit.groupName = returnData.name;
							_t.addEdit.viewStatus = returnData.viewType.toString();
							// 存储已选的设备id集合
							var deviceArr = new Array();
							if (returnData.alarmNoticeGroupAssetList.length !== 0) {
								returnData.alarmNoticeGroupAssetList.forEach((item)=>{
									deviceArr.push(item.assetId);
								});
								_t.$refs.vueTree.setCheckedKeys(deviceArr);
								var selectedKeys = _t.$refs.vueTree.getCheckedKeys();
								_t.addEdit.isSelectNum = selectedKeys.length;
								if (selectedKeys.length === _t.deviceListArr.length) {
									_t.allcheckedData = true;
								} else {
									_t.allcheckedData = false;
								}
							}
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
			}
		},
		created() {
			this.$store.commit('setLoading', true);
			this.getData();
		}
	}
</script>

<style scoped>
</style>
<style>
	.alarmGroupSettings-dialog .el-dialog {
		width: 860px;
		height: 562px;
	}

	.alarmGroupSettings-role-dialog .el-dialog {
		width: 410px;
		height: 562px;
	}

	.role-dialog-line {
		position: relative;
	}

	.role-dialog-checkout .el-checkbox__label {
		font-size: 12px;
	}

	.role-dialog-line div.line {
		position: absolute;
		top: -10px;
		left: -20px;
		right: -20px;
		height: 1px;
		border-bottom: 1px solid #eaedf1;
	}
</style>
