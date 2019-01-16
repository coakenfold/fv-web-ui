package ca.firstvoices.property_readers;

import org.nuxeo.ecm.core.api.DocumentModel;

import java.util.ArrayList;
import java.util.List;

public class FV_SimpleListPropertyReader extends FV_AbstractPropertyReader
{
    private String[] columnList;

    public FV_SimpleListPropertyReader( String ptr, String[] cnfo )
    {
        super( ptr, "" );
        columnList = cnfo;
    }

    public List<FV_PropertyValueWithColumnName>readPropertyFromObject(Object o)
    {
        DocumentModel word = (DocumentModel)o;
        List<FV_PropertyValueWithColumnName> readValues = new ArrayList<>();

        //TODO: implement simple list

        readValues.add( new FV_PropertyValueWithColumnName("IMPLEMENT", " IMPLEMENT" ));

        return readValues;
    }
}
