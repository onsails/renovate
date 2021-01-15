"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data = new Map();
data.set('extract.py', "import sys\nimport json\nimport os\nimport distutils.core\nfrom os.path import dirname, realpath\n\nif sys.version_info[:2] >= (3, 3):\n  from importlib.machinery import SourceFileLoader\n  def load_source(name, path):\n    if not os.path.exists(path):\n      return {}\n    return vars(SourceFileLoader('mod', path).load_module())\nelse:\n  import imp\n  def load_source(name, path):\n    if not os.path.exists(path):\n      return {}\n    return vars(imp.load_source('mod', path))\n\ntry:\n  import setuptools\nexcept ImportError:\n  class setuptools:\n    def setup():\n      pass\n\ntry:\n  from unittest import mock\nexcept ImportError:\n  # for python3.3+\n  import mock\n\n@mock.patch.object(setuptools, 'setup')\n@mock.patch.object(distutils.core, 'setup')\ndef invoke(mock1, mock2):\n  # Inserting the parent directory of the target setup.py in Python import path:\n  sys.path.append(dirname(realpath(sys.argv[-1])))\n  # This is setup.py which calls setuptools.setup\n  load_source('_target_setup_', sys.argv[-1])\n  # called arguments are in `mock_setup.call_args`\n  call_args = mock1.call_args or mock2.call_args\n  args, kwargs = call_args\n  with open('renovate-pip_setup-report.json', 'w', encoding='utf-8') as f:\n    json.dump(kwargs, f, ensure_ascii=False, indent=2)\n\ninvoke()\n");
data.set('node-js-schedule.json', "{\n  \"v0.10\": {\n    \"start\": \"2013-03-11\",\n    \"end\": \"2016-10-31\"\n  },\n  \"v0.12\": {\n    \"start\": \"2015-02-06\",\n    \"end\": \"2016-12-31\"\n  },\n  \"v4\": {\n    \"start\": \"2015-09-08\",\n    \"lts\": \"2015-10-12\",\n    \"maintenance\": \"2017-04-01\",\n    \"end\": \"2018-04-30\",\n    \"codename\": \"Argon\"\n  },\n  \"v5\": {\n    \"start\": \"2015-10-29\",\n    \"maintenance\": \"2016-04-30\",\n    \"end\": \"2016-06-30\"\n  },\n  \"v6\": {\n    \"start\": \"2016-04-26\",\n    \"lts\": \"2016-10-18\",\n    \"maintenance\": \"2018-04-30\",\n    \"end\": \"2019-04-30\",\n    \"codename\": \"Boron\"\n  },\n  \"v7\": {\n    \"start\": \"2016-10-25\",\n    \"maintenance\": \"2017-04-30\",\n    \"end\": \"2017-06-30\"\n  },\n  \"v8\": {\n    \"start\": \"2017-05-30\",\n    \"lts\": \"2017-10-31\",\n    \"maintenance\": \"2019-01-01\",\n    \"end\": \"2019-12-31\",\n    \"codename\": \"Carbon\"\n  },\n  \"v9\": {\n    \"start\": \"2017-10-01\",\n    \"maintenance\": \"2018-04-01\",\n    \"end\": \"2018-06-30\"\n  },\n  \"v10\": {\n    \"start\": \"2018-04-24\",\n    \"lts\": \"2018-10-30\",\n    \"maintenance\": \"2020-05-19\",\n    \"end\": \"2021-04-30\",\n    \"codename\": \"Dubnium\"\n  },\n  \"v11\": {\n    \"start\": \"2018-10-23\",\n    \"maintenance\": \"2019-04-22\",\n    \"end\": \"2019-06-01\"\n  },\n  \"v12\": {\n    \"start\": \"2019-04-23\",\n    \"lts\": \"2019-10-21\",\n    \"maintenance\": \"2020-11-30\",\n    \"end\": \"2022-04-30\",\n    \"codename\": \"Erbium\"\n  },\n  \"v13\": {\n    \"start\": \"2019-10-22\",\n    \"maintenance\": \"2020-04-01\",\n    \"end\": \"2020-06-01\"\n  },\n  \"v14\": {\n    \"start\": \"2020-04-21\",\n    \"lts\": \"2020-10-27\",\n    \"maintenance\": \"2021-10-19\",\n    \"end\": \"2023-04-30\",\n    \"codename\": \"\"\n  },\n  \"v15\": {\n    \"start\": \"2020-10-20\",\n    \"maintenance\": \"2021-04-01\",\n    \"end\": \"2021-06-01\"\n  },\n  \"v16\": {\n    \"start\": \"2021-04-20\",\n    \"lts\": \"2021-10-26\",\n    \"maintenance\": \"2022-10-18\",\n    \"end\": \"2024-04-30\",\n    \"codename\": \"\"\n  }\n}\n");
exports.default = data;
//# sourceMappingURL=data-files.generated.js.map