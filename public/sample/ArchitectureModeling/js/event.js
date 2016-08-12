(function windowEvent(Model, $$) {

	document.documentElement.addEventListener('mousedown', function (evt) {
		showMsg(evt.target.id);
		if (window.dragTarget) {
			if (!window.getSVGViewerVersion) {
				evt.preventDefault();
			}
			return false;
		}

		Model.hideMenu();

		if (!window.getSVGViewerVersion) {
			evt.preventDefault();
		}

		if (evt.button === 0) {
			if ($$.hasClass(evt.target, 'SelectMode') || $$.hasClass(evt.target.parentNode, 'SelectMode')) {
				Model.MODE = 'SELECT';
				AllToolbarItem.get('选择').bg.addClass('select');
				AllToolbarItem.get('资源流').bg.removeClass('select');
				Model.select(Model.AllNode.getSelected() || Model.AllEdge.getSelected());
			} else if ($$.hasClass(evt.target, 'LineMode') || $$.hasClass(evt.target.parentNode, 'LineMode')) {
				Model.MODE = 'LINE';
				AllToolbarItem.get('选择').bg.removeClass('select');
				AllToolbarItem.get('资源流').bg.addClass('select');
				Model.select(Model.AllNode.getSelected() || Model.AllEdge.getSelected());
			} else if ($$.hasClass(evt.target, 'DragToolbarIcon')) {
				window.dragTarget = new Model.DragToolbarIcon(evt);
			} else if (Model.MODE === 'SELECT' && $$.hasClass(evt.target, 'DragBound')) {
				window.dragTarget = new Model.DragBound(evt);
			} else if (Model.MODE === 'LINE' && $$.hasClass(evt.target, 'DragNewLine')) {
				window.dragTarget = new Model.DragNewLine(evt);
			} else if ($$.hasClass(evt.target, 'DragLine')) {
				window.dragTarget = new Model.DragLine(evt);
			} else if ($$.hasClass(evt.target.parentNode, 'DragNode')) {
				Model.select(evt.target.parentNode.id);
				window.dragTarget = new Model.DragNode(evt);
			} else if ($$.hasClass(evt.target, 'resourceFlow')) {
				Model.select(evt.target.id);
			} else if ($$.hasClass(evt.target, 'DragPoint')) {
				window.dragTarget = new Model.DragPoint(evt);
			} else if (evt.target.id === 'aerialViewRedBox') {
				//缩略图中的视口拖动
				dragTarget = new Model.DragMiniViewBox(evt);
			} else if (evt.target.id === 'bg') {
				// 面板拖动
				dragTarget = new Model.DragMainPanel(evt);
				Model.select();
			}

		} else if (evt.button === 2) {

			if ($$.hasClass(evt.target.parentNode, 'DragNode') || $$.hasClass(evt.target, 'resourceFlow') || $$.hasClass(evt.target, 'DragPoint')) {
				Model.evt = {
					clientX : evt.clientX,
					clientY : evt.clientY,
					target : evt.target
				};
			}

			if ($$.hasClass(evt.target.parentNode, 'DragNode')) {
				Model.select(evt.target.parentNode.id);
				if (window.getSVGViewerVersion) {
					fireMenu('menuNode');
				} else {
					Model.showMenu('menuNode', evt.clientX, evt.clientY);
				}
			} else if ($$.hasClass(evt.target, 'resourceFlow')) {
				Model.select(evt.target.id);
				if (window.getSVGViewerVersion) {
					fireMenu('menuLine');
				} else {
					Model.showMenu('menuLine', evt.clientX, evt.clientY);
				}
			} else if ($$.hasClass(evt.target, 'DragPoint')) {
				if (window.getSVGViewerVersion) {
					fireMenu('menuPoint');
				} else {
					Model.showMenu('menuPoint', evt.clientX, evt.clientY);
				}
			}
		}

	}, false);

	document.documentElement.addEventListener('mousemove', function (evt) {
		if (window.dragTarget) {
			window.dragTarget.drag(evt);
		}
	}, false);

	document.documentElement.addEventListener('mouseup', function (evt) {
		if (window.dragTarget) {
			window.dragTarget.drop(evt);
		}
	}, false);

/*	document.documentElement.addEventListener('click', function (evt) {
		if (evt.detail !== 2) {
			return false;
		}
		if ($$.hasClass(evt.target.parentNode, 'DragNode')) {
			var node = Model.AllNode.get(evt.target.parentNode.id);
			//projectId为项目ID，programId为工程ID
			//id  为所选元素id
			//elementType为元素类型
			//选择系统时elementType值为"elementSystem"
			//选择组织时elementType值为"elementOrganization"
			//选择人员时elementType值为"elementPeople"
			//选择服务时elementType值为"elementService"
			//选择资源流elementType值为"elementResourceFlow"
			var map = {
				'System' : 'elementSystem',
				'Organization' : 'elementOrganization',
				'Actor' : 'elementPeople',
				'Service' : 'elementService',
				'ResourceFlow' : 'elementResourceFlow'
			};
			alert(map[node.nodeType]);
			if (parent.turnPage) {
				parent.turnPage(map[node.nodeType], node.id, "update", parent.projectId, parent.programId);
			}

		} else if ($$.hasClass(evt.target, 'resourceFlow')) {
			var line = Model.AllNode.get(evt.target.id);
			alert('ResourceFlow')
			if (parent.turnPage) {
				parent.turnPage('ResourceFlow', line.id, "update", parent.projectId, parent.programId);
			}
		}
	}, false);*/

	document.documentElement.addEventListener('keydown', function (evt) {
		var deleteKey = window.getSVGViewerVersion ? 127 : 46;
		if (evt.keyCode === deleteKey) {
			// 选中节点
			var n = Model.AllNode.getSelected();
			if (n) {
				for (var i in Model.AllEdge.all) {
					var l = Model.AllEdge.all[i];
					// 相关线
					if (l.source === n || l.target === n) {
						l.removeSelf();
					}
				}
				n.removeSelf();
			}
			// 选中线
			n = Model.AllEdge.getSelected();
			if (n) {
				n.removeSelf();
			}
		}
	}, false);

	if (!window.getSVGViewerVersion) {
		document.documentElement.addEventListener('selectstart', $$.stop, false);
		document.documentElement.addEventListener('contextmenu', $$.stop, false);
	}
	/**
	 * 工具栏拖动
	 */
	Model.DragToolbarIcon = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.target = evt.target;
		this.x = evt.clientX;
		this.y = evt.clientY;
		this.doOnce = true;
	}

	Model.DragToolbarIcon.prototype = {
		drag : function (evt) {
			if (this.doOnce) {
				this.use = new $$.Use('tempUse', 'toolbarGroup').change(this.target.id).show();
			}
			this.use.position(evt.clientX, evt.clientY);
		},
		drop : function (evt) {
			var ext = {
				x : getWorkspaceX(evt.clientX),
				y : getWorkspaceY(evt.clientY),
				height : 60,
				width : 100,
				backgroundColor : 'white',
				textColor : 'black'
			};

			if ($$.hasClass(this.target, 'ActorNode')) {
				if (parent.turnPage("", "4", "add", parent.projectId, parent.programId)) {
					new Model.ActorNode(parent.tempElement.id || $$.getUuid(), Model.NODE_SPACE, parent.tempElement.name || Model.AllNode.getUniqueName('人员'), ext);
				}
			} else if ($$.hasClass(this.target, 'SystemNode')) {
				if (parent.turnPage("", "2", "add", parent.projectId, parent.programId)) {
					new Model.SystemNode(parent.tempElement.id || $$.getUuid(), Model.NODE_SPACE, parent.tempElement.name || Model.AllNode.getUniqueName('系统'), ext);
				}
			} else if ($$.hasClass(this.target, 'OrganizationNode')) {
				if (parent.turnPage("", "3", "add", parent.projectId, parent.programId)) {
					new Model.OrganizationNode(parent.tempElement.id || $$.getUuid(), Model.NODE_SPACE, parent.tempElement.name || Model.AllNode.getUniqueName('组织'), ext);
				}
			} else if ($$.hasClass(this.target, 'ServiceNode')) {
				if (parent.turnPage("", "5", "add", parent.projectId, parent.programId)) {
					new Model.ServiceNode(parent.tempElement.id || $$.getUuid(), Model.NODE_SPACE, parent.tempElement.name || Model.AllNode.getUniqueName('服务'), ext);
				}
			}
			
			parent.tempElement = null;
			
			if (this.use) {
				this.use.remove();
			}

			window.dragTarget = null;
		}
	};

	/**
	 * 拖动新增连线
	 */
	Model.DragNewLine = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.sourceNode = Model.AllNode.get(evt.target.parentNode.id);
		this.sourcePort = evt.target.getAttribute('port');
		this.x1 = evt.clientX;
		this.y1 = evt.clientY;
		this.doOnce = true;
	};

	Model.DragNewLine.prototype = {
		drag : function (evt) {
			if (this.doOnce) {
				this.line = new $$.Line('tempUse', 'toolbarGroup').addClass('line').show();
			}
			this.line.position({
				x1 : this.x1,
				y1 : this.y1,
				x2 : evt.clientX,
				y2 : evt.clientY
			});
		},
		drop : function (evt) {
			this.targetNode = Model.AllNode.get(evt.target.parentNode.id);
			if (this.targetNode && this.sourceNode != this.targetNode) {
				// 取反向端口
				var portMap = {
					e : 'w',
					w : 'e',
					n : 's',
					s : 'n'
				};
				if (parent.turnPage("", "6", "add", parent.projectId, parent.programId)) {
					new Model.Edge(this.sourceNode.id + this.targetNode.id, 'edgeGroup', this.sourceNode, this.targetNode, this.sourcePort, portMap[this.sourcePort]);
				}
			}
			if (this.line) {
				this.line.remove();
			}
			window.dragTarget = null;
		}
	};

	/**
	 * 拖动节点
	 */
	Model.DragNode = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.target = Model.AllNode.get(evt.target.parentNode.id);
		this.x = evt.clientX - getClientX(this.target.position().x);
		this.y = evt.clientY - getClientY(this.target.position().y);
		this.doOnce = true;
	};

	Model.DragNode.prototype = {
		drag : function (evt) {
			var box;
			if (this.doOnce) {
				box = this.target.bound();
				this.box = new $$.Rect('tempUse', 'nodeGroup').addClass('bound').bound(box.x, box.y, box.width, box.height);
			}
			this.box.position(getWorkspaceX(evt.clientX - this.x) - aerialView.left, getWorkspaceY(evt.clientY - this.y) - aerialView.top);
		},
		drop : function (evt) {
			this.target.position(getWorkspaceX(evt.clientX - this.x) - aerialView.left, getWorkspaceY(evt.clientY - this.y) - aerialView.top).draw();
			// 同步连线
			Model.AllEdge.draw(true);
			if (this.box) {
				this.box.remove();
			}
			window.dragTarget = null;
		}
	};

	/**
	 * 拖动转折点
	 */
	Model.DragPoint = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.line = Model.AllEdge.get(evt.target.getAttribute('for'));
		this.index = +evt.target.getAttribute('index');
	};

	Model.DragPoint.prototype = {
		drag : function (evt) {
			this.line.ext.points[this.index] = {
				x : $$.round(getWorkspaceX(evt.clientX)),
				y : $$.round(getWorkspaceY(evt.clientY))
			};
			this.line.draw(true).addGuide();
		},
		drop : function (evt) {
			window.dragTarget = null;
		}
	};

	/**
	 * 拖动调整元素尺寸
	 */
	Model.DragBound = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.target = evt.target;
		this.node = Model.AllNode.get(evt.target.getAttribute('for'));
		this.port = evt.target.getAttribute('port');
		this.x = evt.clientX;
		this.y = evt.clientY;
		this.doOnce = true;
	};

	Model.DragBound.prototype = {
		drag : function (evt) {
			var box;
			if (this.doOnce) {
				box = this.node.bound();
				this.box = new $$.Rect('tempUse', 'nodeGroup').addClass('bound').bound(box.x, box.y, box.width, box.height);
			} // TODO
			box = this.box.bound();
			var dx = (evt.clientX - this.x) / aerialView._z;
			var dy = (evt.clientY - this.y) / aerialView._z;
			if (this.port === 's') {
				this.box.bound(box.x, box.y, box.width, box.height + dy);
			} else if (this.port === 'sw') {
				this.box.bound(box.x + dx, box.y, box.width - dx, box.height + dy);
			} else if (this.port === 'se') {
				this.box.bound(box.x, box.y, box.width + dx, box.height + dy);
			} else if (this.port === 'e') {
				this.box.bound(box.x, box.y, box.width + dx, box.height);
			} else if (this.port === 'ne') {
				this.box.bound(box.x, box.y + dy, box.width + dx, box.height - dy);
			} else if (this.port === 'n') {
				this.box.bound(box.x, box.y + dy, box.width, box.height - dy);
			} else if (this.port === 'nw') {
				this.box.bound(box.x + dx, box.y + dy, box.width - dx, box.height - dy);
			} else if (this.port === 'w') {
				this.box.bound(box.x + dx, box.y, box.width - dx, box.height);
			}
		},
		drop : function (evt) {
			if (this.box) {
				var box = this.box.bound();
				this.node.bound(box.x, box.y, box.width, box.height).draw().addGuide();
				this.box.remove();
			}
			// 同步连线
			Model.AllEdge.draw(true);
			window.dragTarget = null;
		}
	};

	/**
	 * 拖动连线端点
	 */
	Model.DragLine = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.line = Model.AllEdge.get(evt.target.getAttribute('for'));
		this.index = +evt.target.getAttribute('index');
		if (this.index === 0) {
			this.node = this.line.source;
			this.port = this.line.sourcePort;
		} else {
			this.node = this.line.target;
			this.port = this.line.targetPort;
		}
	};

	Model.DragLine.prototype = {
		drag : function (evt) {
			this.line.ext.points[this.index] = {
				x : getWorkspaceX(evt.clientX),
				y : getWorkspaceY(evt.clientY)
			};
			this.line.draw().addGuide();
			var node;
			this.newNode = null;
			this.newPort = null;
			// 判断四个点位
			for (var n in Model.AllNode.all) {
				node = Model.AllNode.all[n];
				/*if (Math.abs(node.position().x + node.size().width / 2 - getWorkspaceX(evt.clientX)) < 8
				&& Math.abs(node.position().y - getWorkspaceY(evt.clientY)) < 8) {
				this.newNode = node;
				this.newPort = 'n';
				this.showTip();
				break;
				} else if (Math.abs(node.position().x + node.size().width / 2 - getWorkspaceX(evt.clientX)) < 8
				&& Math.abs(node.position().y + node.size().height - getWorkspaceY(evt.clientY)) < 8) {
				this.newNode = node;
				this.newPort = 's';
				this.showTip();
				break;
				} else if (Math.abs(node.position().x - getWorkspaceX(evt.clientX)) < 8
				&& Math.abs(node.position().y + node.size().height / 2 - getWorkspaceY(evt.clientY)) < 8) {
				this.newNode = node;
				this.newPort = 'w';
				this.showTip();
				break;
				} else if (Math.abs(node.position().x + node.size().width - getWorkspaceX(evt.clientX)) < 8
				&& Math.abs(node.position().y + node.size().height / 2 - getWorkspaceY(evt.clientY)) < 8) {
				this.newNode = node;
				this.newPort = 'e';
				this.showTip();
				break;
				}*/
				var p = node.bound();
				if (getWorkspaceX(evt.clientX) > p.x && getWorkspaceX(evt.clientX) < p.x + p.width
					 && getWorkspaceY(evt.clientY) > p.y && getWorkspaceY(evt.clientY) < p.y + p.height) {
					this.newNode = node;
					this.newPort = 'w';
					this.showTip();
				}
			}
			if (!this.newPort) {
				this.hideTip();
			}
		},
		drop : function (evt) {
			if (this.newNode) {
				if (this.index === 0) {
					if (this.newNode !== this.line.target) {
						this.line.source = this.newNode;
					}
				} else {
					if (this.newNode !== this.line.source) {
						this.line.target = this.newNode;
					}
				}
				this.hideTip();
			}
			this.line.syncEndPoint().addGuide().draw(true);
			window.dragTarget = null;
		},
		showTip : function () {
			this.line.getGuide(this.index).addClass('tip');
		},
		hideTip : function () {
			this.line.getGuide(this.index).removeClass('tip');
		}
	};

	/**
	 * 面板的拖动
	 * @param {Object} evt
	 */
	Model.DragMainPanel = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.clientX = evt.clientX;
		this.clientY = evt.clientY;
		this.viewBox = $$.$('mainPanel').getAttribute('viewBox').split(' ');
	};

	Model.DragMainPanel.prototype = {
		drag : function (evt) {
			//面板真实移动的距离
			aerialView.left = (this.clientX - evt.clientX) / aerialView._z + 1 * this.viewBox[0];
			aerialView.top = (this.clientY - evt.clientY) / aerialView._z + 1 * this.viewBox[1];
			aerialView.draw();
		},
		drop : function () {
			dragTarget = null;
		}
	};

	/**
	 *  缩略图中的视口的拖动
	 */
	Model.DragMiniViewBox = function (evt) {
		$$.Interface.ensureImplements(this, $$.Drag);
		this.clientX = evt.clientX;
		this.clientY = evt.clientY;
		this.viewBox = $$.$('mainPanel').getAttribute('viewBox').split(' ');
	};

	Model.DragMiniViewBox.prototype = {
		drag : function (evt) {
			//面板真实移动的距离
			aerialView.left = (evt.clientX - this.clientX) * aerialView.vSize / aerialView.width + 1 * this.viewBox[0];
			aerialView.top = (evt.clientY - this.clientY) * aerialView.vSize / aerialView.height + 1 * this.viewBox[1];
			//showMsg(aerialView.left + '|' + aerialView.top)
			aerialView.draw();
		},
		drop : function () {
			//aerialView.draw();
			dragTarget = null;
		}
	};

	function getWorkspaceX(x) {
		var d;
		if (window.getSVGViewerVersion) {
			d = (x - $$.$(Model.MAIN_PANEL).getAttribute('x')) / aerialView._z + $$.$(Model.NODE_SPACE).getCTM().e + aerialView.left;
		} else {
			d = (x - $$.$(Model.MAIN_PANEL).getAttribute('x')) / aerialView._z + aerialView.left;
		}
		return d;
	}

	function getWorkspaceY(y) {
		var d;
		if (window.getSVGViewerVersion) {
			d = (y - $$.$(Model.MAIN_PANEL).getAttribute('y')) / aerialView._z + $$.$(Model.NODE_SPACE).getCTM().f + aerialView.top;
		} else {
			d = (y - $$.$(Model.MAIN_PANEL).getAttribute('y')) / aerialView._z + aerialView.top;
		}
		return d;
	}

	function getClientX(x) {
		if (window.getSVGViewerVersion) {
			return +x + (1 * $$.$(Model.MAIN_PANEL).getAttribute('x') - $$.$(Model.NODE_SPACE).getCTM().e) * aerialView._z;
		} else {
			return +x + 1 * $$.$(Model.MAIN_PANEL).getAttribute('x');
		}
	}

	function getClientY(y) {
		if (window.getSVGViewerVersion) {
			return +y + (1 * $$.$(Model.MAIN_PANEL).getAttribute('y') - $$.$(Model.NODE_SPACE).getCTM().f) * aerialView._z;
		} else {
			return +y + 1 * $$.$(Model.MAIN_PANEL).getAttribute('y');
		}
	}

	function fireMenu(menuId) {
		if (window.getSVGViewerVersion) {
			var newMenuRoot;
			newMenuRoot = parseXML(printNode($$.$(menuId)), contextMenu);
			contextMenu.replaceChild(newMenuRoot.firstChild, contextMenu.firstChild);
		}
	}

	Model.addPoint = function () {
		var evt = Model.evt;
		var flow = Model.AllEdge.getSelected();
		var point = {
			x : getWorkspaceX(evt.clientX),
			y : getWorkspaceY(evt.clientY)
		};
		var index = flow.shape.checkIn(point.x, point.y);
		point = {
			x : $$.round(point.x),
			y : $$.round(point.y)
		}
		flow.addPoint(point, index).removeGuide().addGuide().draw();
		Model.select(evt.target.id);
		Model.menuLine.group.hide();
	}

	Model.removePoint = function () {
		var evt = Model.evt;
		var id = evt.target.getAttribute('for');
		var flow = Model.AllEdge.get(id);
		var index = +evt.target.getAttribute('index');
		flow.removePoint(index).removeGuide().addGuide().draw();
		Model.select(id);
		Model.hideMenu();
	}

	Model.moveBottom = function () {
		var node = Model.AllNode.getSelected();
		var g = node.group.self;
		var p = g.parentNode;
		if (p.firstChild !== g) {
			p.insertBefore(g, p.firstChild);
		}
		Model.hideMenu();
	}

	Model.moveTop = function () {
		var node = Model.AllNode.getSelected();
		var g = node.group.self;
		var p = g.parentNode;
		p.appendChild(g);
		Model.hideMenu();
	}

	Model.editNode = function () {
		var node = Model.AllNode.getSelected();
		//projectId为项目ID，programId为工程ID
		//id  为所选元素id
		//elementType为元素类型
		//选择系统时elementType值为"elementSystem"
		//选择组织时elementType值为"elementOrganization"
		//选择人员时elementType值为"elementPeople"
		//选择服务时elementType值为"elementService"
		//选择资源流elementType值为"elementResourceFlow"
		var map = {
			'System' : 'elementSystem',
			'Organization' : 'elementOrganization',
			'Actor' : 'elementPeople',
			'Service' : 'elementService',
			'ResourceFlow' : 'elementResourceFlow'
		};

		if (parent.turnPage) {
			parent.turnPage(map[node.nodeType], node.id, "update", parent.projectId, parent.programId);
		}
	}

	Model.editLine = function () {
		var line = Model.AllNode.getSelected();

		if (parent.turnPage) {
			parent.turnPage('ResourceFlow', line.id, "update", parent.projectId, parent.programId);
		}
	}

	Model.showMenu = function (type, x, y) {
		Model[type].group.position(x, y).show();
	}

	Model.hideMenu = function () {
		Model.menuPoint.group.hide();
		Model.menuNode.group.hide();
		Model.menuLine.group.hide();
	}
})(Model, $$);
