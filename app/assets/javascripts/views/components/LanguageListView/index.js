var React = require('react');
var classNames = require('classnames');

var Languages = require('models/Languages');

var DirectoryOperations = require('../../../operations/DirectoryOperations');

class LanguageListItem extends React.Component {

	render() {		
		var dialectsLink = "#browse/family/" + this.props.family + "/" + this.props.title;

		return (
			<div className="dialectListItem">
				<span>{this.props.title} </span><a href={dialectsLink}>[Explore Dialects]</a>
			</div>
		);
	}
}

class LanguageList extends React.Component {
	
	constructor(props) {
		super(props);    
		console.log(this.props.data);
		console.log(this.props.data.length);

    	var family = this.props.family;

	    var languageListItems = [];
	    
	    this.props.data.each(function(language) {
	    	console.log(language);
	    	var id = language.get("id");
	    	//console.log(id);	
	    	var title = language.get("title");
	    	//console.log(title);	    	
	    	languageListItems.push(<LanguageListItem key={id} title={title} family={family} />);	    	
	    });
	    	
	    this.state = {
	    	languageListItems: languageListItems
    	};
	}

	render() {
		
	    return (
			<div className="languageList">
				{this.state.languageListItems}
			</div>
		);
	}
}

class LanguageListView extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			languages: null
    	};
		
		DirectoryOperations.getLanguages(props.client, props.family).then((function(languages){
	        this.setState({
	        	languages: languages
	        });
	    	//console.log(languages);
		}).bind(this));		
	}

	render() {
		//console.log(this.props.family);
		var languageList = "";
		if(this.state.languages != null && this.state.languages.length > 0) {
			languageList = <LanguageList data={this.state.languages} family={this.props.family} />;
		}
		return (
    		<div>{languageList}</div>
		);
	}
}

module.exports = LanguageListView;